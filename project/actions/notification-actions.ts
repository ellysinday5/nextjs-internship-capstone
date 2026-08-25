"use server";

import {
  acceptProjectInviteAction,
  declineProjectInviteAction,
} from "@/actions/member-actions";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import { invites, type notificationTypeEnum, notifications, projects } from "@/lib/db/schema";
import { toSlug } from "@/lib/project-data";
import { getActiveWorkspaceId } from "@/lib/workspace-helpers";
import { auth } from "@clerk/nextjs/server";
import { type InferSelectModel, and, count, eq, isNull, or, sql } from "drizzle-orm";

export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

type CreateNotificationInput = {
  workspaceId?: string;
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  message?: string;
  href?: string;
  metadata?: Record<string, unknown>;
};

// ============================================
// CREATE (called from OTHER actions, e.g. invite-actions.ts, task-actions.ts)
// Not user-facing directly, so no auth check here — caller already
// verified the acting user before calling this.
// ============================================
export async function createNotification(data: CreateNotificationInput) {
  await db.insert(notifications).values(data);
}

/**
 * Notifies all project members when a new calendar event is scheduled for their project.
 */
export async function notifyProjectEventCreatedAction(data: {
  projectId: string;
  eventTitle: string;
  eventDate: string;
  eventType: string;
}) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const [project] = await db
      .select({ id: projects.id, name: projects.name, workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, data.projectId));

    if (!project) return { success: false, error: "Project not found" };

    const { projectMembers } = await import("@/lib/db/schema");
    const members = await db
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, data.projectId));

    for (const m of members) {
      if (m.userId && m.userId !== user.id) {
        await createNotification({
          workspaceId: project.workspaceId ?? undefined,
          recipientId: m.userId,
          actorId: user.id,
          type: "task_assigned",
          title: "New Project Event",
          message: `${user.name} scheduled a new ${data.eventType || "event"} "${data.eventTitle}" for "${project.name}" on ${data.eventDate}.`,
          href: `/calendar`,
          metadata: {
            projectId: project.id,
            projectName: project.name,
            eventTitle: data.eventTitle,
            eventDate: data.eventDate,
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[notifyProjectEventCreatedAction] Error:", error);
    return { success: false, error: "Failed to send notifications." };
  }
}

async function getDbUser(clerkId: string) {
  let dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, clerkId),
  });
  if (!dbUser) {
    dbUser = (await syncUser()) ?? undefined;
  }
  return dbUser;
}

// ============================================
// READ — latest N notifications for the dropdown
// ============================================
export async function getRecentNotificationsAction(limit = 10) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized", data: null };

  const dbUser = await getDbUser(clerkId);
  if (!dbUser) return { success: false, error: "User not found", data: null };

  const activeWorkspaceId = await getActiveWorkspaceId(dbUser.id);

  const results = await db.query.notifications.findMany({
    where: (n, { and, eq, or, isNull }) =>
      and(
        eq(n.recipientId, dbUser.id),
        activeWorkspaceId
          ? or(eq(n.workspaceId, activeWorkspaceId), isNull(n.workspaceId))
          : undefined,
      ),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit,
    with: {
      actor: {
        columns: { id: true, name: true, email: true },
      },
    },
  });

  return { success: true, error: null, data: results };
}

// ============================================
// READ — paginated, for the full /settings/notifications page
// ============================================
export async function getAllNotificationsAction(page = 1, pageSize = 20) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized", data: null };

  const dbUser = await getDbUser(clerkId);
  if (!dbUser) return { success: false, error: "User not found", data: null };

  const activeWorkspaceId = await getActiveWorkspaceId(dbUser.id);

  const results = await db.query.notifications.findMany({
    where: (n, { and, eq, or, isNull }) =>
      and(
        eq(n.recipientId, dbUser.id),
        activeWorkspaceId
          ? or(eq(n.workspaceId, activeWorkspaceId), isNull(n.workspaceId))
          : undefined,
      ),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: {
      actor: { columns: { id: true, name: true, email: true } },
    },
  });

  return { success: true, error: null, data: results };
}

// ============================================
// READ — unread count for the bell badge
// ============================================
export async function getUnreadNotificationCountAction() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized", data: 0 };

  const dbUser = await getDbUser(clerkId);
  if (!dbUser) return { success: false, error: "User not found", data: 0 };

  const activeWorkspaceId = await getActiveWorkspaceId(dbUser.id);

  const whereClause = activeWorkspaceId
    ? and(
        eq(notifications.recipientId, dbUser.id),
        eq(notifications.isRead, false),
        or(eq(notifications.workspaceId, activeWorkspaceId), isNull(notifications.workspaceId)),
      )
    : and(eq(notifications.recipientId, dbUser.id), eq(notifications.isRead, false));

  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(whereClause);

  return { success: true, error: null, data: result?.count ?? 0 };
}

// ============================================
// UPDATE — mark one as read (called on click)
// ============================================
export async function markNotificationAsReadAction(notificationId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized" };

  const dbUser = await getDbUser(clerkId);
  if (!dbUser) return { success: false, error: "User not found" };

  // Guard: only allow marking your OWN notifications as read
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.recipientId, dbUser.id)));

  return { success: true, error: null };
}

// ============================================
// UPDATE — mark all as read
// ============================================
export async function markAllNotificationsAsReadAction() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized" };

  const dbUser = await getDbUser(clerkId);
  if (!dbUser) return { success: false, error: "User not found" };

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.recipientId, dbUser.id), eq(notifications.isRead, false)));

  return { success: true, error: null };
}

// ============================================
// DELETE — dismiss / remove one notification
// ============================================
export async function deleteNotificationAction(notificationId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized" };

  const dbUser = await getDbUser(clerkId);
  if (!dbUser) return { success: false, error: "User not found" };

  await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.recipientId, dbUser.id)));

  return { success: true, error: null };
}

// ============================================
// INVITATION NOTIFICATION ACTIONS
// ============================================
export async function acceptProjectInvitationNotificationAction(notificationId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [notification] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.recipientId, user.id)));

    if (!notification) {
      return { success: false, error: "Notification not found." };
    }

    const metadata = (notification.metadata ?? {}) as {
      inviteId?: string;
      projectId?: string;
      projectName?: string;
      role?: string;
    };

    let inviteId = metadata.inviteId;

    if (!inviteId) {
      const targetProjectId =
        metadata.projectId ||
        (notification.href ? notification.href.split("/projects/")[1]?.split("/")[0] : null);

      if (!targetProjectId) {
        return { success: false, error: "Could not identify project for this invitation." };
      }

      const [pendingInvite] = await db
        .select({ id: invites.id })
        .from(invites)
        .where(
          and(
            eq(invites.projectId, targetProjectId),
            sql`LOWER(${invites.email}) = ${user.email.toLowerCase()}`,
            eq(invites.status, "pending"),
          ),
        )
        .orderBy(sql`${invites.createdAt} DESC`)
        .limit(1);

      if (!pendingInvite) {
        // Check if already accepted
        const [anyInvite] = await db
          .select({ status: invites.status })
          .from(invites)
          .where(
            and(
              eq(invites.projectId, targetProjectId),
              sql`LOWER(${invites.email}) = ${user.email.toLowerCase()}`,
            ),
          )
          .limit(1);

        if (anyInvite?.status === "accepted") {
          await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId));
          // Fetch project name to derive slug for consistent redirect
          const [proj] = await db
            .select({ name: projects.name })
            .from(projects)
            .where(eq(projects.id, targetProjectId))
            .limit(1);
          const projectSlug = proj?.name ? toSlug(proj.name) : targetProjectId;
          return { success: true, projectId: targetProjectId, projectSlug, alreadyMember: true };
        }

        return { success: false, error: "Invitation is no longer active or was not found." };
      }

      inviteId = pendingInvite.id;
    }

    // Call shared core accept action from member-actions.ts
    const result = await acceptProjectInviteAction(inviteId);
    if (!result.success) {
      return result;
    }

    // Mark originating notification as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    // Notify inviter (actor) if present
    if (notification.actorId) {
      const projectName = metadata.projectName || "the project";
      await createNotification({
        workspaceId: notification.workspaceId ?? undefined,
        recipientId: notification.actorId,
        actorId: user.id,
        type: "invite_accepted",
        title: "Invitation Accepted",
        message: `${user.name} accepted your invitation to join "${projectName}".`,
        href: `/projects/${result.projectSlug ?? result.projectId}`,
        metadata: {
          projectId: result.projectId,
          projectName,
          acceptedByUserId: user.id,
        },
      });
    }

    return { success: true, projectId: result.projectId, projectSlug: result.projectSlug };
  } catch (error) {
    console.error("[acceptProjectInvitationNotificationAction] Error:", error);
    return { success: false, error: "Failed to accept invitation." };
  }
}

export async function declineProjectInvitationNotificationAction(notificationId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [notification] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.recipientId, user.id)));

    if (!notification) {
      return { success: false, error: "Notification not found." };
    }

    const metadata = (notification.metadata ?? {}) as {
      inviteId?: string;
      projectId?: string;
      projectName?: string;
    };

    let inviteId = metadata.inviteId;

    if (!inviteId) {
      const targetProjectId =
        metadata.projectId ||
        (notification.href ? notification.href.split("/projects/")[1]?.split("/")[0] : null);

      if (targetProjectId) {
        const [pendingInvite] = await db
          .select({ id: invites.id })
          .from(invites)
          .where(
            and(
              eq(invites.projectId, targetProjectId),
              sql`LOWER(${invites.email}) = ${user.email.toLowerCase()}`,
              eq(invites.status, "pending"),
            ),
          )
          .limit(1);

        if (pendingInvite) {
          inviteId = pendingInvite.id;
        }
      }
    }

    if (inviteId) {
      await declineProjectInviteAction(inviteId);
    }

    // Mark notification as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    return { success: true };
  } catch (error) {
    console.error("[declineProjectInvitationNotificationAction] Error:", error);
    return { success: false, error: "Failed to decline invitation." };
  }
}

export type NotificationWithActor = InferSelectModel<typeof notifications> & {
  actor: { id: string; name: string; email: string } | null;
};
