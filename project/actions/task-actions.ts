"use server";

import { createNotification } from "@/actions/notification-actions";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import {
  comments,
  lists,
  projectMembers,
  projects,
  taskSharedTeams,
  tasks,
  users,
  workspaceMembers,
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
import { isTaskCompleted } from "@/lib/project-stats";
import { toSlug } from "@/lib/project-data";
import { and, asc, eq, inArray, isNotNull, ne, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

export interface SharedTeamRecord {
  id: string;
  name: string;
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
  isPublic: boolean;
  sharedTeams?: SharedTeamRecord[];
  createdAt: Date | null;
  updatedAt: Date | null;
  /** Set when status transitions TO "Complete"; cleared when reopened. */
  completedAt: Date | null;
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

    const [wsMember] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, project.workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );
    if (wsMember) return true;
  }

  return false;
}

export async function assertTaskReadAccess(taskId: string, userId: string): Promise<boolean> {
  const [task] = await db
    .select({
      id: tasks.id,
      isPublic: tasks.isPublic,
      listId: tasks.listId,
    })
    .from(tasks)
    .where(eq(tasks.id, taskId));

  if (!task) return false;
  if (task.isPublic) return true;

  const projectId = await getProjectIdForList(task.listId);
  if (projectId) {
    const hasProjectAccess = await assertProjectAccess(projectId, userId);
    if (hasProjectAccess) return true;
  }

  // Check if user belongs to any explicitly shared team
  const sharedMemberships = await db
    .select({ id: taskSharedTeams.id })
    .from(taskSharedTeams)
    .innerJoin(projects, eq(taskSharedTeams.teamId, projects.id))
    .leftJoin(
      projectMembers,
      and(eq(projectMembers.projectId, projects.id), eq(projectMembers.userId, userId)),
    )
    .where(
      and(
        eq(taskSharedTeams.taskId, taskId),
        or(eq(projects.ownerId, userId), isNotNull(projectMembers.id)),
      ),
    );

  return sharedMemberships.length > 0;
}

/* Get all tasks for a project — joined with assignee, comment counts, and shared teams */
export async function getProjectTasksAction(projectId: string): Promise<TaskRecord[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return [];

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
        isPublic: tasks.isPublic,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        completedAt: tasks.completedAt,
        assigneeName: users.name,
        assigneeEmail: users.email,
        pmName: projectMembers.name,
        commentsCount: sql<number>`(
          select count(*)::int from ${comments} where ${comments.taskId} = ${tasks.id}
        )`,
      })
      .from(tasks)
      .innerJoin(lists, eq(tasks.listId, lists.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .leftJoin(
        projectMembers,
        and(
          eq(projectMembers.projectId, projectId),
          or(eq(projectMembers.userId, tasks.assigneeId), eq(projectMembers.id, tasks.assigneeId)),
        ),
      )
      .where(eq(lists.projectId, projectId))
      .orderBy(asc(tasks.position));

    const taskIds = rows.map((r) => r.id);
    const sharedTeamsMap = new Map<string, SharedTeamRecord[]>();

    if (taskIds.length > 0) {
      const sharedRows = await db
        .select({
          taskId: taskSharedTeams.taskId,
          teamId: projects.id,
          teamName: projects.name,
        })
        .from(taskSharedTeams)
        .innerJoin(projects, eq(taskSharedTeams.teamId, projects.id))
        .where(inArray(taskSharedTeams.taskId, taskIds));

      for (const sr of sharedRows) {
        const list = sharedTeamsMap.get(sr.taskId) || [];
        list.push({ id: sr.teamId, name: sr.teamName });
        sharedTeamsMap.set(sr.taskId, list);
      }
    }

    return rows.map((r) => {
      const name = r.assigneeName || r.pmName;
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        listId: r.listId,
        assigneeId: r.assigneeId,
        assignee:
          r.assigneeId && name
            ? { id: r.assigneeId, name, email: r.assigneeEmail || "" }
            : null,
        priority: r.priority,
        status: r.status,
        dueDate: r.dueDate,
        position: r.position,
        commentsCount: r.commentsCount,
        isPublic: r.isPublic ?? false,
        sharedTeams: sharedTeamsMap.get(r.id) || [],
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        completedAt: r.completedAt,
      };
    });
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

    const [project] = await db
      .select({ id: projects.id, name: projects.name, workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, projectId));

    // Resolve assigneeId to a valid users.id if provided
    let resolvedAssigneeId: string | null = null;
    if (assigneeId && assigneeId !== "unassigned") {
      const [u] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, assigneeId));
      if (u) {
        resolvedAssigneeId = u.id;
      } else {
        const [pm] = await db
          .select({ id: projectMembers.id, userId: projectMembers.userId, name: projectMembers.name })
          .from(projectMembers)
          .where(eq(projectMembers.id, assigneeId));
        if (pm?.userId) {
          resolvedAssigneeId = pm.userId;
        } else if (pm?.name) {
          const [uByName] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.name, pm.name));
          if (uByName) {
            resolvedAssigneeId = uByName.id;
            await db
              .update(projectMembers)
              .set({ userId: uByName.id })
              .where(eq(projectMembers.id, pm.id));
          }
        }
      }
    }

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
        assigneeId: resolvedAssigneeId,
        priority: priority || null,
        status: status || "On track",
        dueDate: dueDate ? new Date(dueDate) : null,
        position: maxPosition + 1,
      })
      .returning();

    let assigneeInfo: TaskAssignee | null = null;
    if (resolvedAssigneeId) {
      const assignedUser = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, resolvedAssigneeId!),
        columns: { id: true, name: true, email: true },
      });
      if (assignedUser) {
        assigneeInfo = assignedUser;
      }
    }

    const projectSlug = toSlug(project?.name || "project");
    const href = `/projects/${projectSlug}?taskId=${newTask.id}`;

    if (resolvedAssigneeId && resolvedAssigneeId !== user.id) {
      await createNotification({
        workspaceId: project?.workspaceId ?? undefined,
        recipientId: resolvedAssigneeId,
        actorId: user.id,
        type: "task_assigned",
        title: "Task Assigned",
        message: `${user.name} assigned you to "${title}".`,
        href,
        metadata: { taskId: newTask.id, projectId, projectSlug },
      });
    }

    revalidatePath(`/projects/${projectId}`);
    return {
      success: true,
      task: {
        ...newTask,
        assignee: assigneeInfo,
        commentsCount: 0,
      } as TaskRecord,
    };
  } catch (error: unknown) {
    console.error("[createTaskAction] Error creating task:", error);
    const msg = error instanceof Error ? error.message : "Failed to create task. Please try again.";
    return { success: false, error: msg };
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

    const { id, dueDate, assigneeId, ...rest } = validated.data;

    const [existing] = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        listId: tasks.listId,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        assigneeId: tasks.assigneeId,
      })
      .from(tasks)
      .where(eq(tasks.id, id));
    if (!existing) return { success: false, error: "Task not found." };

    const projectId = await getProjectIdForList(existing.listId);
    if (!projectId) return { success: false, error: "Project not found." };

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    const [project] = await db
      .select({ id: projects.id, name: projects.name, workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, projectId));

    // Resolve assigneeId if provided
    let resolvedAssigneeId: string | null | undefined = undefined;
    if (assigneeId !== undefined) {
      if (assigneeId === null || assigneeId === "unassigned" || assigneeId === "") {
        resolvedAssigneeId = null;
      } else {
        const [u] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, assigneeId));
        if (u) {
          resolvedAssigneeId = u.id;
        } else {
          const [pm] = await db
            .select({ id: projectMembers.id, userId: projectMembers.userId, name: projectMembers.name })
            .from(projectMembers)
            .where(eq(projectMembers.id, assigneeId));
          if (pm?.userId) {
            resolvedAssigneeId = pm.userId;
          } else if (pm?.name) {
            const [uByName] = await db
              .select({ id: users.id })
              .from(users)
              .where(eq(users.name, pm.name));
            if (uByName) {
              resolvedAssigneeId = uByName.id;
              await db
                .update(projectMembers)
                .set({ userId: uByName.id })
                .where(eq(projectMembers.id, pm.id));
            } else {
              resolvedAssigneeId = null;
            }
          } else {
            resolvedAssigneeId = null;
          }
        }
      }
    }

    // Compute completedAt based on status transition
    let completedAtUpdate: Date | null | undefined = undefined;
    if (rest.status !== undefined) {
      const becomingComplete = isTaskCompleted(rest.status);
      const wasComplete = isTaskCompleted(existing.status);
      if (becomingComplete && !wasComplete) {
        completedAtUpdate = new Date();
      } else if (!becomingComplete && wasComplete) {
        completedAtUpdate = null;
      }
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...rest,
        ...(resolvedAssigneeId !== undefined ? { assigneeId: resolvedAssigneeId } : {}),
        dueDate: dueDate === undefined ? undefined : dueDate ? new Date(dueDate) : null,
        updatedAt: new Date(),
        ...(completedAtUpdate !== undefined ? { completedAt: completedAtUpdate } : {}),
      })
      .where(eq(tasks.id, id))
      .returning();

    // Fetch updated assignee information for return
    let assigneeInfo: TaskAssignee | null = null;
    const finalAssigneeId = updatedTask.assigneeId;
    if (finalAssigneeId) {
      const assignedUser = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, finalAssigneeId),
        columns: { id: true, name: true, email: true },
      });
      if (assignedUser) {
        assigneeInfo = assignedUser;
      }
    }

    // --- NOTIFICATIONS ---
    const projectSlug = toSlug(project?.name || "project");
    const href = `/projects/${projectSlug}?taskId=${id}`;
    const taskTitle = updatedTask.title || existing.title;

    // 1. If newly assigned or reassigned to a user (and not self)
    const isNewAssignment =
      resolvedAssigneeId !== undefined &&
      resolvedAssigneeId !== null &&
      resolvedAssigneeId !== existing.assigneeId &&
      resolvedAssigneeId !== user.id;

    if (isNewAssignment && resolvedAssigneeId) {
      await createNotification({
        workspaceId: project?.workspaceId ?? undefined,
        recipientId: resolvedAssigneeId,
        actorId: user.id,
        type: "task_assigned",
        title: "Task Assigned",
        message: `${user.name} assigned you to "${taskTitle}".`,
        href,
        metadata: {
          taskId: id,
          projectId,
          projectSlug,
        },
      });
    }

    // 2. If task was updated (status, title, priority, due date, description) and the task has an assignee (who is not the editor and wasn't already notified about new assignment)
    const targetRecipientId = isNewAssignment ? null : finalAssigneeId;
    if (targetRecipientId && targetRecipientId !== user.id) {
      const statusChanged = rest.status !== undefined && rest.status !== existing.status;
      const titleChanged = rest.title !== undefined && rest.title !== existing.title;
      const priorityChanged = rest.priority !== undefined && rest.priority !== existing.priority;
      const dueDateChanged =
        dueDate !== undefined &&
        ((dueDate === null && existing.dueDate !== null) ||
          (dueDate !== null &&
            (!existing.dueDate ||
              new Date(dueDate).getTime() !== new Date(existing.dueDate).getTime())));
      const descChanged = rest.description !== undefined && rest.description !== existing.description;

      if (statusChanged) {
        await createNotification({
          workspaceId: project?.workspaceId ?? undefined,
          recipientId: targetRecipientId,
          actorId: user.id,
          type: "task_status_changed",
          title: "Task Status Updated",
          message: `${user.name} changed status of "${taskTitle}" to "${rest.status}".`,
          href,
          metadata: {
            taskId: id,
            projectId,
            projectSlug,
            status: rest.status,
          },
        });
      } else if (titleChanged || priorityChanged || dueDateChanged || descChanged) {
        await createNotification({
          workspaceId: project?.workspaceId ?? undefined,
          recipientId: targetRecipientId,
          actorId: user.id,
          type: "task_status_changed",
          title: "Task Updated",
          message: `${user.name} updated your task "${taskTitle}".`,
          href,
          metadata: {
            taskId: id,
            projectId,
            projectSlug,
          },
        });
      }
    }

    revalidatePath(`/projects/${projectId}`);
    return {
      success: true,
      task: {
        ...updatedTask,
        assignee: assigneeInfo,
      },
    };
  } catch (error: unknown) {
    console.error("[updateTaskAction] Error updating task:", error);
    return { success: false, error: "Failed to update task. Please try again." };
  }
}

/* Move Task — drag to another column, or reorder within the same one. */
export async function moveTaskAction(data: MoveTaskFormValues) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = moveTaskSchema.safeParse(data);
    if (!validated.success) return { success: false, error: "Invalid move data" };

    const { taskId, toListId, toPosition, status: nextStatus } = validated.data;

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) return { success: false, error: "Task not found." };

    const destProjectId = await getProjectIdForList(toListId);
    if (!destProjectId) return { success: false, error: "Destination list not found." };

    const hasAccess = await assertProjectAccess(destProjectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    const fromListId = task.listId;
    const oldPos = task.position;
    const newPos = toPosition;

    // Calculate completedAt if nextStatus is specified
    let completedAtUpdate: Date | null | undefined = undefined;
    if (nextStatus !== undefined) {
      const becomingComplete = isTaskCompleted(nextStatus);
      const wasComplete = isTaskCompleted(task.status);
      if (becomingComplete && !wasComplete) {
        completedAtUpdate = new Date();
      } else if (!becomingComplete && wasComplete) {
        completedAtUpdate = null;
      }
    }

    if (fromListId === toListId) {
      if (oldPos < newPos) {
        // Shift tasks between (oldPos, newPos] DOWN by 1
        await db
          .update(tasks)
          .set({ position: sql`${tasks.position} - 1` })
          .where(
            and(
              eq(tasks.listId, fromListId),
              sql`${tasks.position} > ${oldPos} AND ${tasks.position} <= ${newPos}`,
            ),
          );
      } else if (oldPos > newPos) {
        // Shift tasks between [newPos, oldPos) UP by 1
        await db
          .update(tasks)
          .set({ position: sql`${tasks.position} + 1` })
          .where(
            and(
              eq(tasks.listId, fromListId),
              sql`${tasks.position} >= ${newPos} AND ${tasks.position} < ${oldPos}`,
            ),
          );
      }

      await db
        .update(tasks)
        .set({
          position: newPos,
          updatedAt: new Date(),
          ...(nextStatus !== undefined ? { status: nextStatus } : {}),
          ...(completedAtUpdate !== undefined ? { completedAt: completedAtUpdate } : {}),
        })
        .where(eq(tasks.id, taskId));
    } else {
      // Moving across lists:
      // 1. Close the gap left behind in the source list
      await db
        .update(tasks)
        .set({ position: sql`${tasks.position} - 1` })
        .where(and(eq(tasks.listId, fromListId), sql`${tasks.position} > ${oldPos}`));

      // 2. Make room at the target slot in the destination list
      await db
        .update(tasks)
        .set({ position: sql`${tasks.position} + 1` })
        .where(and(eq(tasks.listId, toListId), sql`${tasks.position} >= ${newPos}`));

      // 3. Place the task in the destination list
      await db
        .update(tasks)
        .set({
          listId: toListId,
          position: newPos,
          updatedAt: new Date(),
          ...(nextStatus !== undefined ? { status: nextStatus } : {}),
          ...(completedAtUpdate !== undefined ? { completedAt: completedAtUpdate } : {}),
        })
        .where(eq(tasks.id, taskId));
    }

    // Notify assignee if status changed due to column move
    if (
      nextStatus !== undefined &&
      nextStatus !== task.status &&
      task.assigneeId &&
      task.assigneeId !== user.id
    ) {
      const [destProject] = await db
        .select({ id: projects.id, name: projects.name, workspaceId: projects.workspaceId })
        .from(projects)
        .where(eq(projects.id, destProjectId));
      const projectSlug = toSlug(destProject?.name || "project");
      await createNotification({
        workspaceId: destProject?.workspaceId ?? undefined,
        recipientId: task.assigneeId,
        actorId: user.id,
        type: "task_status_changed",
        title: "Task Status Updated",
        message: `${user.name} moved your task "${task.title}" to "${nextStatus}".`,
        href: `/projects/${projectSlug}?taskId=${taskId}`,
        metadata: {
          taskId,
          projectId: destProjectId,
          projectSlug,
          status: nextStatus,
        },
      });
    }

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

export interface BatchedProjectTaskRecord extends TaskRecord {
  projectId: string;
  projectName: string;
}

/* Batched query to fetch tasks across multiple project IDs in a single query */
export async function getTasksForProjectsAction(
  projectIds: string[],
): Promise<BatchedProjectTaskRecord[]> {
  try {
    if (!projectIds || projectIds.length === 0) return [];

    const user = await syncUser();
    if (!user) return [];

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
        completedAt: tasks.completedAt,
        assigneeName: users.name,
        assigneeEmail: users.email,
        commentsCount: sql<number>`(
          select count(*)::int from ${comments} where ${comments.taskId} = ${tasks.id}
        )`,
        projectId: projects.id,
        projectName: projects.name,
      })
      .from(tasks)
      .innerJoin(lists, eq(tasks.listId, lists.id))
      .innerJoin(projects, eq(lists.projectId, projects.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(inArray(projects.id, projectIds))
      .orderBy(asc(tasks.dueDate), asc(tasks.position));

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
      isPublic: false,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      completedAt: r.completedAt,
      projectId: r.projectId,
      projectName: r.projectName,
    }));
  } catch (error) {
    console.error("[getTasksForProjectsAction] Error fetching batched tasks:", error);
    return [];
  }
}

/* Toggle task visibility between Public and Private */
export async function toggleTaskVisibilityAction(taskId: string, makePublic?: boolean) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [task] = await db
      .select({ id: tasks.id, listId: tasks.listId, isPublic: tasks.isPublic })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) return { success: false, error: "Task not found." };

    const projectId = await getProjectIdForList(task.listId);
    if (!projectId) return { success: false, error: "Project not found." };

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    const nextIsPublic = makePublic !== undefined ? makePublic : !task.isPublic;

    const [updated] = await db
      .update(tasks)
      .set({ isPublic: nextIsPublic, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning({ isPublic: tasks.isPublic });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, isPublic: updated?.isPublic ?? nextIsPublic };
  } catch (error: unknown) {
    console.error("[toggleTaskVisibilityAction] Error:", error);
    return { success: false, error: "Failed to update task visibility." };
  }
}

export interface TaskPrivacyResult {
  success: boolean;
  error?: string;
  isPublic?: boolean;
  sharedTeams?: SharedTeamRecord[];
  availableTeams?: SharedTeamRecord[];
}

/* Get current privacy state, shared teams, and candidate teams in the workspace */
export async function getTaskPrivacyAction(taskId: string): Promise<TaskPrivacyResult> {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const [task] = await db
      .select({ id: tasks.id, listId: tasks.listId, isPublic: tasks.isPublic })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) return { success: false, error: "Task not found." };

    const projectId = await getProjectIdForList(task.listId);
    if (!projectId) return { success: false, error: "Project not found." };

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    // Get current shared teams
    const shared = await db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(taskSharedTeams)
      .innerJoin(projects, eq(taskSharedTeams.teamId, projects.id))
      .where(eq(taskSharedTeams.taskId, taskId));

    // Get project's workspace to find other teams in the same workspace
    const [currProject] = await db
      .select({ workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, projectId));

    let availableTeams: SharedTeamRecord[] = [];
    if (currProject?.workspaceId) {
      availableTeams = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(
          and(
            eq(projects.workspaceId, currProject.workspaceId),
            ne(projects.id, projectId),
          ),
        )
        .orderBy(asc(projects.name));
    } else {
      // Fallback: other projects user owns/belongs to
      availableTeams = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(and(eq(projects.ownerId, user.id), ne(projects.id, projectId)))
        .orderBy(asc(projects.name));
    }

    return {
      success: true,
      isPublic: task.isPublic,
      sharedTeams: shared,
      availableTeams,
    };
  } catch (error) {
    console.error("[getTaskPrivacyAction] Error:", error);
    return { success: false, error: "Failed to fetch task privacy data." };
  }
}

/* Update the teams that this private task is explicitly shared with */
export async function setTaskSharedTeamsAction(taskId: string, teamIds: string[]) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [task] = await db
      .select({ id: tasks.id, listId: tasks.listId })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) return { success: false, error: "Task not found." };

    const projectId = await getProjectIdForList(task.listId);
    if (!projectId) return { success: false, error: "Project not found." };

    const hasAccess = await assertProjectAccess(projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    // Sequential queries (neon-http driver does not support transactions)
    await db.delete(taskSharedTeams).where(eq(taskSharedTeams.taskId, taskId));

    const validTeamIds = Array.from(new Set(teamIds.filter((t) => t && t.trim()))).filter(
      (t) => t !== projectId,
    );

    if (validTeamIds.length > 0) {
      await db.insert(taskSharedTeams).values(
        validTeamIds.map((teamId) => ({
          taskId,
          teamId,
        })),
      );
    }

    const updatedShared = await db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(taskSharedTeams)
      .innerJoin(projects, eq(taskSharedTeams.teamId, projects.id))
      .where(eq(taskSharedTeams.taskId, taskId));

    revalidatePath(`/projects/${projectId}`);
    return { success: true, sharedTeams: updatedShared };
  } catch (error) {
    console.error("[setTaskSharedTeamsAction] Error:", error);
    return { success: false, error: "Failed to update shared teams." };
  }
}

/* Get single task details with permissions & privacy check */
export async function getTaskDetailsAction(taskId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const hasReadAccess = await assertTaskReadAccess(taskId, user.id);
    if (!hasReadAccess) return { success: false, error: "Access denied." };

    const [r] = await db
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
        isPublic: tasks.isPublic,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        completedAt: tasks.completedAt,
        assigneeName: users.name,
        assigneeEmail: users.email,
        commentsCount: sql<number>`(
          select count(*)::int from ${comments} where ${comments.taskId} = ${tasks.id}
        )`,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.id, taskId));

    if (!r) return { success: false, error: "Task not found." };

    const shared = await db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(taskSharedTeams)
      .innerJoin(projects, eq(taskSharedTeams.teamId, projects.id))
      .where(eq(taskSharedTeams.taskId, taskId));

    return {
      success: true,
      task: {
        id: r.id,
        title: r.title,
        description: r.description,
        listId: r.listId,
        assigneeId: r.assigneeId,
        assignee:
          r.assigneeId
            ? { id: r.assigneeId, name: r.assigneeName || "Member", email: r.assigneeEmail || "" }
            : null,
        priority: r.priority,
        status: r.status,
        dueDate: r.dueDate,
        position: r.position,
        commentsCount: r.commentsCount,
        isPublic: r.isPublic ?? false,
        sharedTeams: shared,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        completedAt: r.completedAt,
      },
    };
  } catch (error) {
    console.error("[getTaskDetailsAction] Error:", error);
    return { success: false, error: "Failed to fetch task details." };
  }
}

