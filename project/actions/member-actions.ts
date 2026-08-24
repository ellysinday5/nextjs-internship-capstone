"use server";

import { db } from "@/lib/db";
import { canManageProjectMembers, canManageWorkspace, syncUser } from "@/lib/db/auth";
import {
  comments,
  invites,
  lists,
  projectMembers,
  projects,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import { toSlug } from "@/lib/project-data";
import type { TeamMember } from "@/lib/team-data";
import { and, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type ProjectMember = TeamMember;

export interface UserWorkspace {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member";
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  projectCount: number;
  memberCount: number;
  createdAt: Date | null;
  isActive: boolean;
}

export interface UserWorkspacesResult {
  ownedWorkspaces: UserWorkspace[];
  memberWorkspaces: UserWorkspace[];
  activeWorkspace: UserWorkspace | null;
}

export interface UserPendingInvite {
  id: string;
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
  inviterName: string;
  inviterEmail: string;
  role: string;
  createdAt: Date | null;
  expiresAt: Date;
}

export interface ProjectPermissions {
  canManageMembers: boolean;
  canManageWorkspace: boolean;
  projectRole: string | null;
  workspaceRole: string | null;
}

async function assertProjectAccess(projectId: string, userId: string): Promise<boolean> {
  const [project] = await db
    .select({ id: projects.id, ownerId: projects.ownerId, workspaceId: projects.workspaceId })
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) return false;
  if (project.ownerId === userId) return true;

  const [member] = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));

  if (member) return true;

  if (project.workspaceId) {
    const [ws] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(and(eq(workspaces.id, project.workspaceId), eq(workspaces.ownerId, userId)));
    if (ws) return true;
  }

  return false;
}

export async function getProjectMembersAction(projectId: string): Promise<TeamMember[]> {
  try {
    const user = await syncUser();
    if (!user || !projectId) return [];
    if (!(await assertProjectAccess(projectId, user.id))) return [];

    const rows = await db
      .select({
        id: projectMembers.id,
        userId: projectMembers.userId,
        name: projectMembers.name,
        role: projectMembers.role,
        email: users.email,
      })
      .from(projectMembers)
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      email: r.email ?? "—",
      role: r.role,
      status: "Offline" as const,
      accountType: r.role === "admin" ? "Admin" : "Member",
      projectCount: 0,
    }));
  } catch (error) {
    console.error("[getProjectMembersAction] Error:", error);
    return [];
  }
}

export async function getMemberTasksAction(userId: string, projectId: string) {
  try {
    const user = await syncUser();
    if (!user) return [];
    if (!(await assertProjectAccess(projectId, user.id))) return [];

    const projectLists = await db
      .select({ id: lists.id })
      .from(lists)
      .where(eq(lists.projectId, projectId));
    if (projectLists.length === 0) return [];

    const listIds = projectLists.map((l) => l.id);

    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.assigneeId, userId), inArray(tasks.listId, listIds)));
  } catch (error) {
    console.error("[getMemberTasksAction] Error:", error);
    return [];
  }
}

export async function getMemberCommentsAction(userId: string, projectId: string) {
  try {
    const user = await syncUser();
    if (!user) return [];
    if (!(await assertProjectAccess(projectId, user.id))) return [];

    const projectLists = await db
      .select({ id: lists.id })
      .from(lists)
      .where(eq(lists.projectId, projectId));
    if (projectLists.length === 0) return [];

    const projectTasks = await db
      .select({ id: tasks.id, title: tasks.title })
      .from(tasks)
      .where(
        inArray(
          tasks.listId,
          projectLists.map((l) => l.id),
        ),
      );
    if (projectTasks.length === 0) return [];

    const taskTitleMap = new Map(projectTasks.map((t) => [t.id, t.title]));

    const rows = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.authorId, userId),
          inArray(
            comments.taskId,
            projectTasks.map((t) => t.id),
          ),
        ),
      );

    return rows.map((c) => ({ ...c, taskTitle: taskTitleMap.get(c.taskId) ?? "Untitled task" }));
  } catch (error) {
    console.error("[getMemberCommentsAction] Error:", error);
    return [];
  }
}

/* ─────────────────────────────────────────────────────────────
   Workspace Server Actions
───────────────────────────────────────────────────────────── */

export async function getUserWorkspacesAction(): Promise<UserWorkspacesResult> {
  try {
    const user = await syncUser();
    if (!user) {
      return { ownedWorkspaces: [], memberWorkspaces: [], activeWorkspace: null };
    }

    const cookieStore = await cookies();
    const activeWorkspaceIdCookie = cookieStore.get("current_workspace_id")?.value;

    // 1. Fetch owned workspaces
    const ownedRows = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        ownerId: workspaces.ownerId,
        createdAt: workspaces.createdAt,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(workspaces)
      .leftJoin(users, eq(workspaces.ownerId, users.id))
      .where(eq(workspaces.ownerId, user.id));

    // 2. Fetch member workspaces (where role != 'owner')
    const memberRows = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        ownerId: workspaces.ownerId,
        role: workspaceMembers.role,
        createdAt: workspaces.createdAt,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .leftJoin(users, eq(workspaces.ownerId, users.id))
      .where(and(eq(workspaceMembers.userId, user.id), ne(workspaceMembers.role, "owner")));

    // 3. Project counts per workspace
    const projectCounts = await db
      .select({
        workspaceId: projects.workspaceId,
        count: sql<number>`cast(count(${projects.id}) as int)`,
      })
      .from(projects)
      .where(isNotNull(projects.workspaceId))
      .groupBy(projects.workspaceId);

    const projCountMap = new Map<string, number>();
    for (const pc of projectCounts) {
      if (pc.workspaceId) {
        projCountMap.set(pc.workspaceId, Number(pc.count));
      }
    }

    // 4. Member counts per workspace
    const memberCounts = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        count: sql<number>`cast(count(${workspaceMembers.id}) as int)`,
      })
      .from(workspaceMembers)
      .groupBy(workspaceMembers.workspaceId);

    const memberCountMap = new Map<string, number>();
    for (const mc of memberCounts) {
      memberCountMap.set(mc.workspaceId, Number(mc.count));
    }

    // Map owned workspaces
    const ownedWorkspaces: UserWorkspace[] = ownedRows.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      role: "owner" as const,
      ownerId: w.ownerId,
      ownerName: w.ownerName ?? undefined,
      ownerEmail: w.ownerEmail ?? undefined,
      projectCount: projCountMap.get(w.id) ?? 0,
      memberCount: memberCountMap.get(w.id) ?? 1,
      createdAt: w.createdAt,
      isActive: false,
    }));

    // Map member workspaces
    const memberWorkspaces: UserWorkspace[] = memberRows.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      role: (w.role ?? "member") as "admin" | "member",
      ownerId: w.ownerId,
      ownerName: w.ownerName ?? undefined,
      ownerEmail: w.ownerEmail ?? undefined,
      projectCount: projCountMap.get(w.id) ?? 0,
      memberCount: memberCountMap.get(w.id) ?? 1,
      createdAt: w.createdAt,
      isActive: false,
    }));

    const allWorkspaces = [...ownedWorkspaces, ...memberWorkspaces];

    // Determine active workspace
    let activeWs = allWorkspaces.find((w) => w.id === activeWorkspaceIdCookie);
    if (!activeWs && allWorkspaces.length > 0) {
      activeWs = allWorkspaces[0];
    }

    if (activeWs) {
      activeWs.isActive = true;
      ownedWorkspaces.forEach((w) => {
        if (w.id === activeWs!.id) w.isActive = true;
      });
      memberWorkspaces.forEach((w) => {
        if (w.id === activeWs!.id) w.isActive = true;
      });
    }

    return {
      ownedWorkspaces,
      memberWorkspaces,
      activeWorkspace: activeWs ?? null,
    };
  } catch (error) {
    console.error("[getUserWorkspacesAction] Error:", error);
    return { ownedWorkspaces: [], memberWorkspaces: [], activeWorkspace: null };
  }
}

export async function switchActiveWorkspaceAction(workspaceId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const cookieStore = await cookies();
    cookieStore.set("current_workspace_id", workspaceId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    revalidatePath("/workspaces");
    revalidatePath("/team");
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[switchActiveWorkspaceAction] Error:", error);
    return { success: false, error: "Failed to switch workspace." };
  }
}

export async function createWorkspaceAction(name: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, error: "Workspace name is required." };

    const baseSlug = toSlug(trimmedName) || "workspace";
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, slug))
        .limit(1);
      if (existing.length === 0) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const newWs = await db.transaction(async (tx) => {
      const [ws] = await tx
        .insert(workspaces)
        .values({
          name: trimmedName,
          slug,
          ownerId: user.id,
        })
        .returning();

      await tx.insert(workspaceMembers).values({
        workspaceId: ws.id,
        userId: user.id,
        role: "owner",
      });

      return ws;
    });

    // Auto-switch to newly created workspace
    const cookieStore = await cookies();
    cookieStore.set("current_workspace_id", newWs.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    revalidatePath("/workspaces");
    revalidatePath("/team");
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, workspace: newWs };
  } catch (error) {
    console.error("[createWorkspaceAction] Error:", error);
    return { success: false, error: "Failed to create workspace." };
  }
}

export async function updateWorkspaceAction(id: string, name: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    if (!ws) return { success: false, error: "Workspace not found." };
    if (ws.ownerId !== user.id)
      return { success: false, error: "Only the owner can rename this workspace." };

    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, error: "Workspace name is required." };

    await db.update(workspaces).set({ name: trimmedName }).where(eq(workspaces.id, id));

    revalidatePath("/workspaces");
    revalidatePath("/team");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[updateWorkspaceAction] Error:", error);
    return { success: false, error: "Failed to update workspace." };
  }
}

export async function deleteWorkspaceAction(id: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    if (!ws) return { success: false, error: "Workspace not found." };
    if (ws.ownerId !== user.id)
      return { success: false, error: "Only the owner can delete this workspace." };

    await db.delete(workspaces).where(eq(workspaces.id, id));

    revalidatePath("/workspaces");
    revalidatePath("/team");
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[deleteWorkspaceAction] Error:", error);
    return { success: false, error: "Failed to delete workspace." };
  }
}

/* ─────────────────────────────────────────────────────────────
   User Pending Invitations Server Actions
───────────────────────────────────────────────────────────── */

export async function getMyPendingInvitesAction(): Promise<UserPendingInvite[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const userEmail = user.email.toLowerCase();

    const rows = await db
      .select({
        id: invites.id,
        projectId: invites.projectId,
        role: invites.role,
        status: invites.status,
        createdAt: invites.createdAt,
        expiresAt: invites.expiresAt,
        projectName: projects.name,
        projectDescription: projects.description,
        workspaceId: projects.workspaceId,
        workspaceName: workspaces.name,
        inviterName: users.name,
        inviterEmail: users.email,
      })
      .from(invites)
      .innerJoin(projects, eq(invites.projectId, projects.id))
      .leftJoin(workspaces, eq(projects.workspaceId, workspaces.id))
      .leftJoin(users, eq(invites.invitedBy, users.id))
      .where(and(sql`LOWER(${invites.email}) = ${userEmail}`, eq(invites.status, "pending")))
      .orderBy(sql`${invites.createdAt} DESC`);

    return rows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      projectName: r.projectName,
      projectDescription: r.projectDescription,
      workspaceId: r.workspaceId,
      workspaceName: r.workspaceName,
      inviterName: r.inviterName || "Team Lead",
      inviterEmail: r.inviterEmail || "",
      role: r.role,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
    }));
  } catch (error) {
    console.error("[getMyPendingInvitesAction] Error:", error);
    return [];
  }
}

export async function acceptProjectInviteAction(inviteId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [invite] = await db.select().from(invites).where(eq(invites.id, inviteId));

    if (!invite) return { success: false, error: "Invitation not found." };
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return { success: false, error: "This invitation was sent to a different email address." };
    }
    if (invite.status !== "pending") {
      return { success: false, error: `Invitation already ${invite.status}.` };
    }
    if (invite.expiresAt < new Date()) {
      await db.update(invites).set({ status: "expired" }).where(eq(invites.id, invite.id));
      return { success: false, error: "Invitation has expired." };
    }

    await db.transaction(async (tx) => {
      // 1. Fetch project to get its linked workspaceId
      const [project] = await tx
        .select({ workspaceId: projects.workspaceId })
        .from(projects)
        .where(eq(projects.id, invite.projectId));

      // 2. Add to project members if not already added
      const [existingMember] = await tx
        .select({ id: projectMembers.id })
        .from(projectMembers)
        .where(
          and(eq(projectMembers.projectId, invite.projectId), eq(projectMembers.userId, user.id)),
        );

      if (!existingMember) {
        await tx.insert(projectMembers).values({
          projectId: invite.projectId,
          userId: user.id,
          name: user.name,
          role: invite.role,
        });
      }

      // 3. Auto workspace-membership: ensure user is a workspace member
      if (project?.workspaceId) {
        const [existingWsMember] = await tx
          .select({ id: workspaceMembers.id })
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.workspaceId, project.workspaceId),
              eq(workspaceMembers.userId, user.id),
            ),
          );

        if (!existingWsMember) {
          await tx.insert(workspaceMembers).values({
            workspaceId: project.workspaceId,
            userId: user.id,
            role: "member",
          });
        }
      }

      // 4. Mark invite as accepted
      await tx
        .update(invites)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(eq(invites.id, invite.id));
    });

    revalidatePath(`/projects`);
    revalidatePath(`/team`);
    revalidatePath(`/dashboard`);
    revalidatePath(`/workspaces`);

    return { success: true, projectId: invite.projectId };
  } catch (error) {
    console.error("[acceptProjectInviteAction] Error:", error);
    return { success: false, error: "Failed to accept invite. Please try again." };
  }
}

export async function declineProjectInviteAction(inviteId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [invite] = await db.select().from(invites).where(eq(invites.id, inviteId));

    if (!invite) return { success: false, error: "Invitation not found." };
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return { success: false, error: "This invitation was sent to a different email address." };
    }

    await db.update(invites).set({ status: "revoked" }).where(eq(invites.id, invite.id));

    revalidatePath(`/team`);
    revalidatePath(`/projects`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("[declineProjectInviteAction] Error:", error);
    return { success: false, error: "Failed to decline invite." };
  }
}

export async function getProjectPermissionsAction(projectId: string): Promise<ProjectPermissions> {
  try {
    const user = await syncUser();
    if (!user || !projectId) {
      return {
        canManageMembers: false,
        canManageWorkspace: false,
        projectRole: null,
        workspaceRole: null,
      };
    }

    const [project] = await db
      .select({ ownerId: projects.ownerId, workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return {
        canManageMembers: false,
        canManageWorkspace: false,
        projectRole: null,
        workspaceRole: null,
      };
    }

    let projectRole: string | null = null;
    if (project.ownerId === user.id) {
      projectRole = "owner";
    } else {
      const [pm] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, user.id)));
      projectRole = pm?.role ?? null;
    }

    let workspaceRole: string | null = null;
    if (project.workspaceId) {
      const [ws] = await db
        .select({ ownerId: workspaces.ownerId })
        .from(workspaces)
        .where(eq(workspaces.id, project.workspaceId));

      if (ws?.ownerId === user.id) {
        workspaceRole = "owner";
      } else {
        const [wm] = await db
          .select({ role: workspaceMembers.role })
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.workspaceId, project.workspaceId),
              eq(workspaceMembers.userId, user.id),
            ),
          );
        workspaceRole = wm?.role ?? null;
      }
    }

    const canManageMembers = canManageProjectMembers(projectRole, workspaceRole);
    const canManageWs = canManageWorkspace(workspaceRole);

    return {
      canManageMembers,
      canManageWorkspace: canManageWs,
      projectRole,
      workspaceRole,
    };
  } catch (error) {
    console.error("[getProjectPermissionsAction] Error:", error);
    return {
      canManageMembers: false,
      canManageWorkspace: false,
      projectRole: null,
      workspaceRole: null,
    };
  }
}
