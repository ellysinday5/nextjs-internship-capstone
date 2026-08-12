"use server";

import { revalidatePath } from "next/cache";
import { eq, and, asc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { lists, projects, tasks } from "@/lib/db/schema";
import { syncUser } from "@/lib/auth";
import {
  createListSchema,
  updateListSchema,
  reorderListsSchema,
  CreateListFormValues,
  UpdateListFormValues,
  ReorderListsFormValues,
} from "@/lib/list-schemas";

export interface ListWithTasks {
  id: string;
  name: string;
  projectId: string;
  position: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  taskCount: number;
}

async function assertProjectOwnership(projectId: string, userId: string) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));
  return !!project;
}

/* Get Lists for a Project */
export async function getListsAction(projectId: string): Promise<ListWithTasks[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const ownsProject = await assertProjectOwnership(projectId, user.id);
    if (!ownsProject) return [];

    const projectLists = await db
      .select()
      .from(lists)
      .where(eq(lists.projectId, projectId))
      .orderBy(asc(lists.position));

    const results: ListWithTasks[] = await Promise.all(
      projectLists.map(async (list) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(tasks)
          .where(eq(tasks.listId, list.id));

        return { ...list, taskCount: count };
      }),
    );

    return results;
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

    const ownsProject = await assertProjectOwnership(projectId, user.id);
    if (!ownsProject) return { success: false, error: "Project not found or access denied." };

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

    const [existing] = await db.select({ projectId: lists.projectId }).from(lists).where(eq(lists.id, id));
    if (!existing) return { success: false, error: "List not found." };

    const ownsProject = await assertProjectOwnership(existing.projectId, user.id);
    if (!ownsProject) return { success: false, error: "Access denied." };

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

    const ownsProject = await assertProjectOwnership(projectId, user.id);
    if (!ownsProject) return { success: false, error: "Access denied." };

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

    const [existing] = await db.select({ projectId: lists.projectId }).from(lists).where(eq(lists.id, listId));
    if (!existing) return { success: false, error: "List not found." };

    const ownsProject = await assertProjectOwnership(existing.projectId, user.id);
    if (!ownsProject) return { success: false, error: "Access denied." };

    await db.delete(lists).where(eq(lists.id, listId));

    revalidatePath(`/projects/${existing.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteListAction] Error deleting list:", error);
    return { success: false, error: "Failed to delete list." };
  }
}