"use server";

import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import {
  type CreateListFormValues,
  type ReorderListsFormValues,
  type UpdateListFormValues,
  createListSchema,
  reorderListsSchema,
  updateListSchema,
} from "@/lib/db/list-schemas";
import {
  lists,
  projectMembers,
  projects,
  tasks,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ListWithTasks {
  id: string;
  name: string;
  projectId: string;
  position: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  taskCount: number;
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

async function assertCanManageProject(projectId: string, userId: string): Promise<boolean> {
  const [project] = await db
    .select({ id: projects.id, ownerId: projects.ownerId, workspaceId: projects.workspaceId })
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) return false;
  if (project.ownerId === userId) return true;

  // Check project role (owner / pm / admin)
  const [member] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));

  if (member) {
    const r = member.role.toLowerCase();
    if (r === "owner" || r === "pm" || r === "project manager" || r === "admin") {
      return true;
    }
  }

  // Check workspace role (owner / admin)
  if (project.workspaceId) {
    const [ws] = await db
      .select({ ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, project.workspaceId));
    if (ws && ws.ownerId === userId) return true;

    const [wsMember] = await db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, project.workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    if (wsMember) {
      const wr = wsMember.role.toLowerCase();
      if (wr === "owner" || wr === "admin") return true;
    }
  }

  return false;
}

/* Get Lists for a Project */
export async function getListsAction(projectId: string): Promise<ListWithTasks[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return [];

    const projectLists = await db
      .select()
      .from(lists)
      .where(eq(lists.projectId, projectId))
      .orderBy(asc(lists.position));

    if (projectLists.length === 0) return [];

    const listIds = projectLists.map((l) => l.id).filter(Boolean);
    if (listIds.length === 0) return projectLists.map((l) => ({ ...l, taskCount: 0 }));

    const taskCountRows = await db
      .select({
        listId: tasks.listId,
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(inArray(tasks.listId, listIds))
      .groupBy(tasks.listId);

    const countMap = new Map(taskCountRows.map((r) => [r.listId, r.count]));

    return projectLists.map((list) => ({
      ...list,
      taskCount: countMap.get(list.id) || 0,
    }));
  } catch (error) {
    console.error("[getListsAction] Error fetching lists:", error);
    return [];
  }
}

/* Create List */
export async function createListAction(data: CreateListFormValues) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = createListSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Invalid list data" };
    }

    const { name, projectId } = validated.data;

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Project not found or access denied." };

    const [{ maxPosition }] = await db
      .select({ maxPosition: sql<number>`coalesce(max(${lists.position}), -1)::int` })
      .from(lists)
      .where(eq(lists.projectId, projectId));

    const [newList] = await db
      .insert(lists)
      .values({ name, projectId, position: maxPosition + 1 })
      .returning();

    revalidatePath(`/projects/${projectId}`);
    return { success: true, list: newList };
  } catch (error: unknown) {
    console.error("[createListAction] Error creating list:", error);
    return { success: false, error: "Failed to create list. Please try again." };
  }
}

/* Update List (rename) */
export async function updateListAction(data: UpdateListFormValues) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = updateListSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Invalid list data" };
    }

    const { id, ...updates } = validated.data;

    const [existing] = await db
      .select({ projectId: lists.projectId })
      .from(lists)
      .where(eq(lists.id, id));
    if (!existing) return { success: false, error: "List not found." };

    const hasAccess = await assertProjectAccess(existing.projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    const [updatedList] = await db
      .update(lists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(lists.id, id))
      .returning();

    revalidatePath(`/projects/${existing.projectId}`);
    return { success: true, list: updatedList };
  } catch (error: unknown) {
    console.error("[updateListAction] Error updating list:", error);
    return { success: false, error: "Failed to update list. Please try again." };
  }
}

/* Reorder Lists (drag columns left/right) */
export async function reorderListsAction(data: ReorderListsFormValues) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = reorderListsSchema.safeParse(data);
    if (!validated.success) return { success: false, error: "Invalid reorder data" };

    const { projectId, orderedIds } = validated.data;

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.update(lists).set({ position: i }).where(eq(lists.id, orderedIds[i]));
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[reorderListsAction] Error reordering lists:", error);
    return { success: false, error: "Failed to reorder lists." };
  }
}

/* Delete List (cascades to tasks) */
export async function deleteListAction(listId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [existing] = await db
      .select({ projectId: lists.projectId })
      .from(lists)
      .where(eq(lists.id, listId));
    if (!existing) return { success: false, error: "List not found." };

    const canManage = await assertCanManageProject(existing.projectId, user.id);
    if (!canManage)
      return { success: false, error: "Only project managers and owners can delete lists." };

    await db.delete(lists).where(eq(lists.id, listId));

    revalidatePath(`/projects/${existing.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteListAction] Error deleting list:", error);
    return { success: false, error: "Failed to delete list." };
  }
}
