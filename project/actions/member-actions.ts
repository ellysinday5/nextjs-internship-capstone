"use server";
 
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectMembers, users, lists, tasks, comments } from "@/lib/db/schema";
import { syncUser } from "@/lib/auth";
import type { TeamMember } from "@/lib/team-data";

export type ProjectMember = TeamMember;
 
async function assertOwnsProject(projectId: string, userId: string) {
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));
  return rows.length > 0;
}
 
export async function getProjectMembersAction(projectId: string): Promise<TeamMember[]> {
  try {
    const user = await syncUser();
    if (!user || !projectId) return [];
    if (!(await assertOwnsProject(projectId, user.id))) return [];
 
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
    if (!(await assertOwnsProject(projectId, user.id))) return [];
 
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
    if (!(await assertOwnsProject(projectId, user.id))) return [];
 
    const projectLists = await db
      .select({ id: lists.id })
      .from(lists)
      .where(eq(lists.projectId, projectId));
    if (projectLists.length === 0) return [];
 
    const projectTasks = await db
      .select({ id: tasks.id, title: tasks.title })
      .from(tasks)
      .where(inArray(tasks.listId, projectLists.map((l) => l.id)));
    if (projectTasks.length === 0) return [];
 
    const taskTitleMap = new Map(projectTasks.map((t) => [t.id, t.title]));
 
    const rows = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.authorId, userId),
          inArray(comments.taskId, projectTasks.map((t) => t.id)),
        ),
      );
 
    return rows.map((c) => ({ ...c, taskTitle: taskTitleMap.get(c.taskId) ?? "Untitled task" }));
  } catch (error) {
    console.error("[getMemberCommentsAction] Error:", error);
    return [];
  }
}