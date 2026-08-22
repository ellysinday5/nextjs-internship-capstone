"use server";

import {
  acceptProjectInviteAction,
  declineProjectInviteAction,
} from "@/actions/member-actions";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import { invites, type notificationTypeEnum, notifications, projects } from "@/lib/db/schema";
import { toSlug } from "@/lib/project-data";
import { auth } from "@clerk/nextjs/server";
import { type InferSelectModel, and, count, eq, sql } from "drizzle-orm";

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

// ============================================
// READ — latest N notifications for the dropdown
// ============================================
export async function getRecentNotificationsAction(limit = 10) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized", data: null };

  const dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, clerkId),
  });
  if (!dbUser) return { success: false, error: "User not found", data: null };

  const results = await db.query.notifications.findMany({
    where: (n, { eq }) => eq(n.recipientId, dbUser.id),
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

  const dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, clerkId),
  });
  if (!dbUser) return { success: false, error: "User not found", data: null };

  const results = await db.query.notifications.findMany({
    where: (n, { eq }) => eq(n.recipientId, dbUser.id),
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

  const dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, clerkId),
  });
  if (!dbUser) return { success: false, error: "User not found", data: 0 };

  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.recipientId, dbUser.id), eq(notifications.isRead, false)));

  return { success: true, error: null, data: result?.count ?? 0 };
}

// ============================================
// UPDATE — mark one as read (called on click)
// ============================================
export async function markNotificationAsReadAction(notificationId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized" };

  const dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, clerkId),
  });
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

  const dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, clerkId),
  });
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

  const dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, clerkId),
  });
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
