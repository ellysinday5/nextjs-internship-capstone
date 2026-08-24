"use server";

import { createNotification } from "@/actions/notification-actions";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import {
  comments,
  lists,
  projectMembers,
  projects,
  tasks,
  users,
  workspaces,
} from "@/lib/db/schema";
import {
  type CreateTaskFormValues,
  type MoveTaskFormValues,
  type UpdateTaskFormValues,
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "@/lib/db/task-schemas";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  listId: string;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  priority: string | null;
  status: string | null;
  dueDate: Date | null;
  position: number;
  commentsCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

async function getProjectIdForList(listId: string): Promise<string | null> {
  const [list] = await db
    .select({ projectId: lists.projectId })
    .from(lists)
    .where(eq(lists.id, listId));
  return list?.projectId ?? null;
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

/* Get all tasks for a project — joined with assignee + comment counts */
export async function getProjectTasksAction(projectId: string): Promise<TaskRecord[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return [];

    const projectLists = await db
      .select({ id: lists.id })
      .from(lists)
      .where(eq(lists.projectId, projectId));
    if (projectLists.length === 0) return [];

    const listIds = projectLists.map((l) => l.id);

    const rows = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        listId: tasks.listId,
        assigneeId: tasks.assigneeId,
        priority: tasks.priority,
        status: tasks.status,
        dueDate: tasks.dueDate,
        position: tasks.position,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assigneeName: users.name,
        assigneeEmail: users.email,
        commentsCount: sql<number>`(
          select count(*)::int from ${comments} where ${comments.taskId} = ${tasks.id}
        )`,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(inArray(tasks.listId, listIds))
      .orderBy(asc(tasks.position));

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      listId: r.listId,
      assigneeId: r.assigneeId,
      assignee:
        r.assigneeId && r.assigneeName && r.assigneeEmail
          ? { id: r.assigneeId, name: r.assigneeName, email: r.assigneeEmail }
          : null,
      priority: r.priority,
      status: r.status,
      dueDate: r.dueDate,
      position: r.position,
      commentsCount: r.commentsCount,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (error) {
    console.error("[getProjectTasksAction] Error fetching tasks:", error);
    return [];
  }
}

/* Create Task */
export async function createTaskAction(data: CreateTaskFormValues) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = createTaskSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Invalid task data" };
    }

    const { title, description, listId, assigneeId, priority, status, dueDate } = validated.data;

    const projectId = await getProjectIdForList(listId);
    if (!projectId) return { success: false, error: "List not found." };

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    const [{ maxPosition }] = await db
      .select({ maxPosition: sql<number>`coalesce(max(${tasks.position}), -1)::int` })
      .from(tasks)
      .where(eq(tasks.listId, listId));

    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description: description || null,
        listId,
        assigneeId: assigneeId || null,
        priority: priority || null,
        status: status || "On track",
        dueDate: dueDate ? new Date(dueDate) : null,
        position: maxPosition + 1,
      })
      .returning();

    if (assigneeId && assigneeId !== user.id) {
      await createNotification({
        recipientId: assigneeId,
        actorId: user.id,
        type: "task_assigned",
        title: "Task Assigned",
        message: `${user.name} assigned you to "${title}".`,
        href: `/projects/${projectId}`,
        metadata: { taskId: newTask.id, projectId },
      });
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, task: newTask };
  } catch (error: unknown) {
    console.error("[createTaskAction] Error creating task:", error);
    return { success: false, error: "Failed to create task. Please try again." };
  }
}

/* Update Task fields (not position/list — see moveTaskAction) */
export async function updateTaskAction(data: UpdateTaskFormValues) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = updateTaskSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Invalid task data" };
    }

    const { id, dueDate, ...rest } = validated.data;

    const [existing] = await db
      .select({ listId: tasks.listId })
      .from(tasks)
      .where(eq(tasks.id, id));
    if (!existing) return { success: false, error: "Task not found." };

    const projectId = await getProjectIdForList(existing.listId);
    if (!projectId) return { success: false, error: "Project not found." };

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...rest,
        dueDate: dueDate === undefined ? undefined : dueDate ? new Date(dueDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    revalidatePath(`/projects/${projectId}`);
    return { success: true, task: updatedTask };
  } catch (error: unknown) {
    console.error("[updateTaskAction] Error updating task:", error);
    return { success: false, error: "Failed to update task. Please try again." };
  }
}

/* Move Task — drag to another column, or reorder within the same one.
   Works for both cases: shift the source list's positions down past the
   old slot, shift the destination list's positions up from the new slot,
   then place the task. When fromListId === toListId this still produces
   a correct reorder because the two updates run against the same rows
   using the pre-move position as the pivot. */
export async function moveTaskAction(data: MoveTaskFormValues) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = moveTaskSchema.safeParse(data);
    if (!validated.success) return { success: false, error: "Invalid move data" };

    const { taskId, toListId, toPosition } = validated.data;

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) return { success: false, error: "Task not found." };

    const destProjectId = await getProjectIdForList(toListId);
    if (!destProjectId) return { success: false, error: "Destination list not found." };

    const hasAccess = await assertProjectAccess(destProjectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    await db.transaction(async (tx) => {
      const fromListId = task.listId;

      // close the gap left behind in the source list
      await tx
        .update(tasks)
        .set({ position: sql`${tasks.position} - 1` })
        .where(and(eq(tasks.listId, fromListId), sql`${tasks.position} > ${task.position}`));

      // make room at the target slot in the destination list
      await tx
        .update(tasks)
        .set({ position: sql`${tasks.position} + 1` })
        .where(and(eq(tasks.listId, toListId), sql`${tasks.position} >= ${toPosition}`));

      // place the task itself
      await tx
        .update(tasks)
        .set({ listId: toListId, position: toPosition, updatedAt: new Date() })
        .where(eq(tasks.id, taskId));
    });

    revalidatePath(`/projects/${destProjectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[moveTaskAction] Error moving task:", error);
    return { success: false, error: "Failed to move task." };
  }
}

/* Delete Task */
export async function deleteTaskAction(taskId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) return { success: false, error: "Task not found." };

    const projectId = await getProjectIdForList(task.listId);
    if (!projectId) return { success: false, error: "Project not found." };

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    await db.delete(tasks).where(eq(tasks.id, taskId));

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteTaskAction] Error deleting task:", error);
    return { success: false, error: "Failed to delete task." };
  }
}
