"use server";

import crypto from "crypto";
import { createNotification } from "@/actions/notification-actions";
import { db } from "@/lib/db";
import { canManageProjectMembers, syncUser } from "@/lib/db/auth";
import {
  invites,
  lists,
  projectMembers,
  projects,
  users,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import { toSlug } from "@/lib/project-data";
import { getActiveWorkspaceId } from "@/lib/workspace-helpers";
import { clerkClient } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const INVITE_EXPIRY_DAYS = 7;

export async function inviteTeamMember(projectId: string, email: string, role = "member") {
  try {
    const currentUser = await syncUser();
    if (!currentUser) return { success: false, error: "Unauthorized. Please sign in." };

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Fetch target project
    const [project] = await db
      .select({
        id: projects.id,
        name: projects.name,
        ownerId: projects.ownerId,
        workspaceId: projects.workspaceId,
      })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return { success: false, error: "Project not found." };
    }

    // 2. Validate inviter permissions
    let projectRole: string | null = null;
    if (project.ownerId === currentUser.id) {
      projectRole = "owner";
    } else {
      const [pm] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(
          and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, currentUser.id)),
        );
      projectRole = pm?.role ?? null;
    }

    let workspaceRole: string | null = null;
    if (project.workspaceId) {
      const [ws] = await db
        .select({ ownerId: workspaces.ownerId })
        .from(workspaces)
        .where(eq(workspaces.id, project.workspaceId));

      if (ws?.ownerId === currentUser.id) {
        workspaceRole = "owner";
      } else {
        const [wm] = await db
          .select({ role: workspaceMembers.role })
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.workspaceId, project.workspaceId),
              eq(workspaceMembers.userId, currentUser.id),
            ),
          );
        workspaceRole = wm?.role ?? null;
      }
    }

    const hasPermission = canManageProjectMembers(projectRole, workspaceRole);
    if (!hasPermission) {
      return {
        success: false,
        error: "Unauthorized. Only project managers and workspace owners can invite members.",
      };
    }

    // 2. Check if user is already a member of this project
    let [targetUser] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = ${trimmedEmail}`);

    const client = await clerkClient();

    // If not found in local DB, check if they exist in Clerk
    if (!targetUser) {
      try {
        const clerkUsers = await client.users.getUserList({ emailAddress: [trimmedEmail] });
        if (clerkUsers.data && clerkUsers.data.length > 0) {
          const clerkUser = clerkUsers.data[0];
          const primaryEmail =
            clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
              ?.emailAddress ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            trimmedEmail;
          const name =
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
            clerkUser.username ||
            primaryEmail.split("@")[0] ||
            "User";

          const [insertedUser] = await db
            .insert(users)
            .values({
              clerkId: clerkUser.id,
              email: primaryEmail,
              name,
            })
            .onConflictDoUpdate({
              target: users.clerkId,
              set: { email: primaryEmail, name, updatedAt: new Date() },
            })
            .returning();
          targetUser = insertedUser;
        }
      } catch (clerkErr) {
        console.warn("[inviteTeamMember] Could not query Clerk users list:", clerkErr);
      }
    }

    if (targetUser) {
      const [existingProjectMember] = await db
        .select({ id: projectMembers.id })
        .from(projectMembers)
        .where(
          and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, targetUser.id)),
        );

      if (existingProjectMember) {
        return { success: false, error: "This user is already a member of this project." };
      }
    }

    // 3. Check for existing pending invite for this email + project
    const [existingPendingInvite] = await db
      .select()
      .from(invites)
      .where(
        and(
          eq(invites.projectId, projectId),
          sql`LOWER(${invites.email}) = ${trimmedEmail}`,
          eq(invites.status, "pending"),
        ),
      );

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + INVITE_EXPIRY_DAYS);

    let savedInviteId: string | undefined;

    if (existingPendingInvite) {
      if (existingPendingInvite.expiresAt > now) {
        return {
          success: false,
          error: "An invitation is already pending for this email in this project.",
        };
      } else {
        // Refresh expired invite
        const [updated] = await db
          .update(invites)
          .set({
            token: crypto.randomUUID(),
            role,
            invitedBy: currentUser.id,
            expiresAt,
            createdAt: now,
          })
          .where(eq(invites.id, existingPendingInvite.id))
          .returning();
        savedInviteId = updated?.id ?? existingPendingInvite.id;
      }
    } else {
      // Create new pending invite
      const [inserted] = await db
        .insert(invites)
        .values({
          email: trimmedEmail,
          projectId,
          invitedBy: currentUser.id,
          token: crypto.randomUUID(),
          status: "pending",
          role,
          expiresAt,
          createdAt: now,
        })
        .returning();
      savedInviteId = inserted?.id;
    }

    // Create in-app notification if the invited user already exists in the system
    if (targetUser) {
      await createNotification({
        workspaceId: project.workspaceId ?? undefined,
        recipientId: targetUser.id,
        actorId: currentUser.id,
        type: "project_invite",
        title: "Project Invitation",
        message: `${currentUser.name} invited you to join "${project.name}" as ${role}.`,
        href: `/projects/${projectId}`,
        metadata: {
          inviteId: savedInviteId,
          projectId,
          projectName: project.name,
          role,
        },
      });
    }

    // 4. If user does NOT have an existing Clerk account, send Clerk signup invitation
    if (!targetUser) {
      try {
        await client.invitations.createInvitation({
          emailAddress: trimmedEmail,
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
          publicMetadata: {
            projectId,
            workspaceId: project.workspaceId ?? null,
            role,
            invitedByUserId: currentUser.id,
          },
          notify: true,
        });
      } catch (err: any) {
        console.error("[inviteTeamMember] Clerk invite notice:", err);
        // Duplicate record in Clerk is non-fatal since our DB invite is recorded
        if (err?.errors?.[0]?.code !== "duplicate_record") {
          console.warn(
            "[inviteTeamMember] Clerk error on createInvitation:",
            err?.errors?.[0]?.message,
          );
        }
      }
    }

    revalidatePath(`/projects`);
    revalidatePath(`/team`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("[inviteTeamMember] Error:", error);
    return { success: false, error: "Failed to send invite. Please try again." };
  }
}

export interface QueuedTeamInvite {
  email: string;
  role: string;
}

export interface CreateTeamWithMembersInput {
  name: string;
  description?: string;
  invites?: QueuedTeamInvite[];
}

/**
 * Creates a new team (project) in the active workspace and invites members
 * in the same submission using the established dual-branch invite strategy.
 */
export async function createTeamWithMembersAction(input: CreateTeamWithMembersInput) {
  try {
    const currentUser = await syncUser();
    if (!currentUser) return { success: false, error: "Unauthorized. Please sign in." };

    const activeWorkspaceId = await getActiveWorkspaceId(currentUser.id);
    if (!activeWorkspaceId) {
      return {
        success: false,
        error: "No active workspace found. Please select or create a workspace first.",
      };
    }

    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return { success: false, error: "Team name is required." };
    }

    // 1. Create team project record in the active workspace
    const [project] = await db
      .insert(projects)
      .values({
        name: trimmedName,
        description: input.description?.trim() || null,
        ownerId: currentUser.id,
        workspaceId: activeWorkspaceId,
        status: "Not Started",
        priority: "Medium",
        techStack: [],
      })
      .returning();

    // 2. Add creator to projectMembers as Owner
    await db.insert(projectMembers).values({
      projectId: project.id,
      userId: currentUser.id,
      name: currentUser.name || "Owner",
      role: "Owner",
    });

    // 3. Seed default Kanban lists
    await db.insert(lists).values([
      { name: "To Do", projectId: project.id, position: 0 },
      { name: "In Progress", projectId: project.id, position: 1 },
      { name: "Review", projectId: project.id, position: 2 },
      { name: "Done", projectId: project.id, position: 3 },
    ]);

    // 4. Invite each queued member using the dual-branch invite logic
    const inviteResults = [];
    if (input.invites && input.invites.length > 0) {
      for (const inv of input.invites) {
        if (inv.email && inv.email.trim()) {
          const res = await inviteTeamMember(
            project.id,
            inv.email.trim(),
            (inv.role || "member").toLowerCase(),
          );
          inviteResults.push({ email: inv.email, ...res });
        }
      }
    }

    revalidatePath("/team");
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/workspaces");

    return {
      success: true,
      project: {
        id: project.id,
        name: project.name,
        slug: toSlug(project.name),
        description: project.description,
      },
      inviteCount: inviteResults.length,
    };
  } catch (error) {
    console.error("[createTeamWithMembersAction] Error:", error);
    return { success: false, error: "Failed to create team. Please try again." };
  }
}

