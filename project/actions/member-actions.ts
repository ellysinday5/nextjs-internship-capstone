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
import { type TeamMember, formatRole } from "@/lib/team-data";
import { getActiveWorkspaceId } from "@/lib/workspace-helpers";
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

    return rows.map((r) => {
      const formatted = formatRole(r.role);
      return {
        id: r.id,
        userId: r.userId,
        name: r.name,
        email: r.email ?? "—",
        role: formatted,
        status: "Offline" as const,
        accountType: formatted === "Admin" ? "Admin" : "Member",
        projectCount: 0,
      };
    });
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

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date | null;
}

export interface WorkspaceOverview {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  createdAt: Date | null;
  userRole: "owner" | "admin" | "member";
  members: WorkspaceMember[];
  projects: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    memberCount: number;
    createdAt: Date | null;
  }[];
}

/**
 * Returns all members of the currently active workspace.
 * Used by the Team page to scope the People tab to the active workspace.
 */
export async function getActiveWorkspaceMembersAction(): Promise<WorkspaceMember[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    if (!activeWorkspaceId) return [];

    // Verify user has access to this workspace
    const [ws] = await db
      .select({ id: workspaces.id, ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, activeWorkspaceId));

    if (!ws) return [];

    // Owner always has access; others must be in workspace_members
    if (ws.ownerId !== user.id) {
      const [wm] = await db
        .select({ id: workspaceMembers.id })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, activeWorkspaceId),
            eq(workspaceMembers.userId, user.id),
          ),
        );
      if (!wm) return [];
    }

    // 1. Owner row
    const [ownerRow] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, ws.ownerId));

    const ownerMember: WorkspaceMember | null = ownerRow
      ? {
          id: `owner-${ws.ownerId}`,
          userId: ws.ownerId,
          name: ownerRow.name,
          email: ownerRow.email,
          role: "owner",
          joinedAt: null,
        }
      : null;

    // 2. Non-owner members
    const memberRows = await db
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
        name: users.name,
        email: users.email,
      })
      .from(workspaceMembers)
      .leftJoin(users, eq(workspaceMembers.userId, users.id))
      .where(
        and(
          eq(workspaceMembers.workspaceId, activeWorkspaceId),
          ne(workspaceMembers.role, "owner"),
        ),
      );

    const members: WorkspaceMember[] = memberRows.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.name ?? "Unknown",
      email: m.email ?? "—",
      role: (m.role as "admin" | "member") ?? "member",
      joinedAt: m.createdAt,
    }));

    return ownerMember ? [ownerMember, ...members] : members;
  } catch (error) {
    console.error("[getActiveWorkspaceMembersAction] Error:", error);
    return [];
  }
}

/**
 * Returns full workspace overview data (workspace info, all members, all projects)
 * for a given workspace ID. Used by the /workspaces/[id] overview page.
 */
export async function getWorkspaceOverviewAction(workspaceId: string): Promise<WorkspaceOverview | null> {
  try {
    const user = await syncUser();
    if (!user) return null;

    // Verify the workspace exists
    const [ws] = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        ownerId: workspaces.ownerId,
        createdAt: workspaces.createdAt,
        ownerName: users.name,
      })
      .from(workspaces)
      .leftJoin(users, eq(workspaces.ownerId, users.id))
      .where(eq(workspaces.id, workspaceId));

    if (!ws) return null;

    // Determine user role in this workspace
    let userRole: "owner" | "admin" | "member";
    if (ws.ownerId === user.id) {
      userRole = "owner";
    } else {
      const [wm] = await db
        .select({ role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, user.id),
          ),
        );
      if (!wm) return null; // No access
      userRole = (wm.role as "admin" | "member") ?? "member";
    }

    // Fetch all members (owner + workspace_members)
    const [ownerRow] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, ws.ownerId));

    const memberRows = await db
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
        name: users.name,
        email: users.email,
      })
      .from(workspaceMembers)
      .leftJoin(users, eq(workspaceMembers.userId, users.id))
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          ne(workspaceMembers.role, "owner"),
        ),
      );

    const ownerMember: WorkspaceMember | null = ownerRow
      ? { id: `owner-${ws.ownerId}`, userId: ws.ownerId, name: ownerRow.name, email: ownerRow.email, role: "owner", joinedAt: ws.createdAt }
      : null;

    const members: WorkspaceMember[] = memberRows.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.name ?? "Unknown",
      email: m.email ?? "—",
      role: (m.role as "admin" | "member") ?? "member",
      joinedAt: m.createdAt,
    }));

    const allMembers = ownerMember ? [ownerMember, ...members] : members;

    // Fetch all projects in this workspace
    const wsProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        priority: projects.priority,
        dueDate: projects.dueDate,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(sql`${projects.createdAt} DESC`);

    // Fetch member counts for those projects
    const projectIds = wsProjects.map((p) => p.id);
    const pmCounts =
      projectIds.length > 0
        ? await db
            .select({
              projectId: projectMembers.projectId,
              count: sql<number>`cast(count(${projectMembers.id}) as int)`,
            })
            .from(projectMembers)
            .where(inArray(projectMembers.projectId, projectIds))
            .groupBy(projectMembers.projectId)
        : [];

    const pmCountMap = new Map<string, number>();
    for (const row of pmCounts) {
      pmCountMap.set(row.projectId, Number(row.count));
    }

    const projectList = wsProjects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      priority: p.priority,
      dueDate: p.dueDate,
      memberCount: pmCountMap.get(p.id) ?? 0,
      createdAt: p.createdAt,
    }));

    return {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      ownerId: ws.ownerId,
      ownerName: ws.ownerName ?? "Workspace Owner",
      createdAt: ws.createdAt,
      userRole,
      members: allMembers,
      projects: projectList,
    };
  } catch (error) {
    console.error("[getWorkspaceOverviewAction] Error:", error);
    return null;
  }
}

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

    // Determine active workspace using the single canonical resolver
    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    let activeWs = allWorkspaces.find((w) => w.id === activeWorkspaceId);
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
    revalidatePath("/settings");

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

export interface UserSentInvite {
  id: string;
  email: string;
  recipientName: string | null;
  projectId: string;
  projectName: string;
  workspaceId: string | null;
  workspaceName: string | null;
  role: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  createdAt: Date | null;
  expiresAt: Date;
  acceptedAt: Date | null;
}

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

export async function getMySentInvitesAction(): Promise<UserSentInvite[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const rows = await db
      .select({
        id: invites.id,
        email: invites.email,
        projectId: invites.projectId,
        role: invites.role,
        status: invites.status,
        createdAt: invites.createdAt,
        expiresAt: invites.expiresAt,
        acceptedAt: invites.acceptedAt,
        projectName: projects.name,
        workspaceId: projects.workspaceId,
        workspaceName: workspaces.name,
        recipientName: users.name,
      })
      .from(invites)
      .innerJoin(projects, eq(invites.projectId, projects.id))
      .leftJoin(workspaces, eq(projects.workspaceId, workspaces.id))
      .leftJoin(users, sql`LOWER(${invites.email}) = LOWER(${users.email})`)
      .where(eq(invites.invitedBy, user.id))
      .orderBy(sql`${invites.createdAt} DESC`);

    const now = new Date();

    return rows.map((r) => {
      let currentStatus = r.status as "pending" | "accepted" | "expired" | "revoked";
      if (currentStatus === "pending" && r.expiresAt < now) {
        currentStatus = "expired";
      }

      return {
        id: r.id,
        email: r.email,
        recipientName: r.recipientName ?? null,
        projectId: r.projectId,
        projectName: r.projectName,
        workspaceId: r.workspaceId,
        workspaceName: r.workspaceName,
        role: r.role,
        status: currentStatus,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
        acceptedAt: r.acceptedAt,
      };
    });
  } catch (error) {
    console.error("[getMySentInvitesAction] Error:", error);
    return [];
  }
}

export async function revokeSentInviteAction(inviteId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [invite] = await db.select().from(invites).where(eq(invites.id, inviteId));
    if (!invite) return { success: false, error: "Invite not found." };
    if (invite.invitedBy !== user.id) {
      return { success: false, error: "You can only revoke invitations that you sent." };
    }

    if (invite.status !== "pending") {
      return { success: false, error: `Cannot revoke invite with status "${invite.status}".` };
    }

    await db.update(invites).set({ status: "revoked" }).where(eq(invites.id, invite.id));

    revalidatePath("/team");
    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    console.error("[revokeSentInviteAction] Error:", error);
    return { success: false, error: "Failed to revoke invitation." };
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

    // Variables captured from the transaction for post-tx use
    let joinedWorkspaceId: string | null = null;
    let joinedProjectName: string = "";

    await db.transaction(async (tx) => {
      // 1. Fetch project to get its linked workspaceId and name (for slug derivation)
      const [project] = await tx
        .select({ workspaceId: projects.workspaceId, name: projects.name })
        .from(projects)
        .where(eq(projects.id, invite.projectId));

      if (project) {
        joinedWorkspaceId = project.workspaceId ?? null;
        joinedProjectName = project.name;
      }

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
      if (joinedWorkspaceId) {
        const [existingWsMember] = await tx
          .select({ id: workspaceMembers.id })
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.workspaceId, joinedWorkspaceId),
              eq(workspaceMembers.userId, user.id),
            ),
          );

        if (!existingWsMember) {
          await tx.insert(workspaceMembers).values({
            workspaceId: joinedWorkspaceId,
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

    // 5. Active Workspace Context Management:
    // Only auto-set current_workspace_id if the user currently has NO active workspace (first invite).
    // If the user already has an active workspace, preserve their current context.
    const currentActiveWorkspaceId = await getActiveWorkspaceId(user.id);
    let isDifferentWorkspace = false;
    let joinedWorkspaceName: string | null = null;

    if (joinedWorkspaceId) {
      const [wsRow] = await db
        .select({ name: workspaces.name })
        .from(workspaces)
        .where(eq(workspaces.id, joinedWorkspaceId));
      joinedWorkspaceName = wsRow?.name ?? null;

      if (!currentActiveWorkspaceId) {
        // Brand-new user with no active workspace -> initialize cookie
        const cookieStore = await cookies();
        cookieStore.set("current_workspace_id", joinedWorkspaceId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        });
      } else if (currentActiveWorkspaceId !== joinedWorkspaceId) {
        isDifferentWorkspace = true;
      }
    }

    revalidatePath(`/projects`);
    revalidatePath(`/team`);
    revalidatePath(`/dashboard`);
    revalidatePath(`/workspaces`);

    // Derive a URL-safe slug from the project name (same function used everywhere else)
    const projectSlug = joinedProjectName ? toSlug(joinedProjectName) : invite.projectId;

    return {
      success: true,
      projectId: invite.projectId,
      projectSlug,
      workspaceId: joinedWorkspaceId,
      workspaceName: joinedWorkspaceName,
      isDifferentWorkspace,
    };
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

export async function getUserWorkspaceRoleAction(): Promise<{
  role: string;
  workspaceId: string | null;
  workspaceName: string | null;
}> {
  try {
    const user = await syncUser();
    if (!user) return { role: "Member", workspaceId: null, workspaceName: null };

    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    if (!activeWorkspaceId) return { role: "Member", workspaceId: null, workspaceName: null };

    // Check if user is the workspace owner
    const [ws] = await db
      .select({ id: workspaces.id, name: workspaces.name, ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, activeWorkspaceId));

    if (!ws) return { role: "Member", workspaceId: null, workspaceName: null };

    if (ws.ownerId === user.id) {
      return { role: "Owner", workspaceId: ws.id, workspaceName: ws.name };
    }

    // Check workspace_members
    const [membership] = await db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, activeWorkspaceId),
          eq(workspaceMembers.userId, user.id),
        ),
      );

    if (membership?.role) {
      const formatted =
        membership.role.charAt(0).toUpperCase() + membership.role.slice(1).toLowerCase();
      return { role: formatted, workspaceId: ws.id, workspaceName: ws.name };
    }

    return { role: "Member", workspaceId: ws.id, workspaceName: ws.name };
  } catch (error) {
    console.error("[getUserWorkspaceRoleAction] Error:", error);
    return { role: "Member", workspaceId: null, workspaceName: null };
  }
}

export async function getActiveWorkspacePeopleAction(): Promise<
  { id: string; name: string; email: string; role: string }[]
> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const activeWorkspaceId = await getActiveWorkspaceId(user.id);
    if (!activeWorkspaceId) return [];

    // Get workspace owner
    const [ws] = await db
      .select({
        id: workspaces.id,
        ownerId: workspaces.ownerId,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(workspaces)
      .leftJoin(users, eq(workspaces.ownerId, users.id))
      .where(eq(workspaces.id, activeWorkspaceId));

    const result: { id: string; name: string; email: string; role: string }[] = [];
    const seen = new Set<string>();

    if (ws && ws.ownerId) {
      seen.add(ws.ownerId);
      result.push({
        id: ws.ownerId,
        name: ws.ownerName || "Workspace Owner",
        email: ws.ownerEmail || "",
        role: "Owner",
      });
    }

    // Get members of the workspace
    const memberRows = await db
      .select({
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        name: users.name,
        email: users.email,
      })
      .from(workspaceMembers)
      .leftJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, activeWorkspaceId));

    for (const m of memberRows) {
      if (m.userId && !seen.has(m.userId)) {
        seen.add(m.userId);
        const formatted = m.role
          ? m.role.charAt(0).toUpperCase() + m.role.slice(1).toLowerCase()
          : "Member";
        result.push({
          id: m.userId,
          name: m.name || m.email?.split("@")[0] || "Member",
          email: m.email || "",
          role: formatted,
        });
      }
    }

    // Also get project members within projects of this workspace
    const projectRows = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.workspaceId, activeWorkspaceId));

    if (projectRows.length > 0) {
      const projIds = projectRows.map((p) => p.id);
      const projMembers = await db
        .select({
          userId: projectMembers.userId,
          name: projectMembers.name,
          role: projectMembers.role,
          email: users.email,
        })
        .from(projectMembers)
        .leftJoin(users, eq(projectMembers.userId, users.id))
        .where(inArray(projectMembers.projectId, projIds));

      for (const pm of projMembers) {
        if (pm.userId && !seen.has(pm.userId)) {
          seen.add(pm.userId);
          result.push({
            id: pm.userId,
            name: pm.name || pm.email?.split("@")[0] || "Member",
            email: pm.email || "",
            role: pm.role || "Member",
          });
        }
      }
    }

    return result;
  } catch (error) {
    console.error("[getActiveWorkspacePeopleAction] Error:", error);
    return [];
  }
}


