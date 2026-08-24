"use server";

import { db } from "@/lib/db";
import { canManageProjectMembers, syncUser } from "@/lib/db/auth";
import {
  comments,
  lists,
  notifications,
  projectMembers,
  projects,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import { toSlug } from "@/lib/project-data";
import {
  createCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from "@/lib/validations/comment";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  clerkId: string;
}

export interface CommentRecord {
  id: string;
  taskId: string;
  authorId: string;
  author: CommentAuthor | null;
  content: string;
  parentCommentId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  replies: CommentRecord[];
}

interface TaskProjectContext {
  taskId: string;
  taskTitle: string;
  assigneeId: string | null;
  projectId: string;
  projectName: string;
  workspaceId: string | null;
}

async function getTaskProjectContext(taskId: string): Promise<TaskProjectContext | null> {
  const [row] = await db
    .select({
      taskId: tasks.id,
      taskTitle: tasks.title,
      assigneeId: tasks.assigneeId,
      projectId: projects.id,
      projectName: projects.name,
      workspaceId: projects.workspaceId,
    })
    .from(tasks)
    .innerJoin(lists, eq(tasks.listId, lists.id))
    .innerJoin(projects, eq(lists.projectId, projects.id))
    .where(eq(tasks.id, taskId));

  return row ?? null;
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

async function checkCanManageProject(projectId: string, userId: string): Promise<boolean> {
  const [project] = await db
    .select({ id: projects.id, ownerId: projects.ownerId, workspaceId: projects.workspaceId })
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) return false;
  if (project.ownerId === userId) return true;

  const [pm] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));

  let workspaceRole: string | null = null;
  if (project.workspaceId) {
    const [ws] = await db
      .select({ ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, project.workspaceId));

    if (ws?.ownerId === userId) {
      workspaceRole = "owner";
    } else {
      const [wm] = await db
        .select({ role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId),
          ),
        );
      workspaceRole = wm?.role ?? null;
    }
  }

  return canManageProjectMembers(pm?.role, workspaceRole);
}

/* =========================================================================
   1. CREATE COMMENT
   ========================================================================= */
export async function createCommentAction(
  taskId: string,
  content: string,
  parentCommentId?: string,
) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = createCommentSchema.safeParse({ taskId, content, parentCommentId });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid comment data",
      };
    }

    const taskCtx = await getTaskProjectContext(taskId);
    if (!taskCtx) return { success: false, error: "Task not found." };

    const hasAccess = await assertProjectAccess(taskCtx.projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied." };

    let parentAuthorClerkId: string | null = null;
    if (parentCommentId) {
      const [parentComment] = await db
        .select({ id: comments.id, authorId: comments.authorId, taskId: comments.taskId })
        .from(comments)
        .where(eq(comments.id, parentCommentId));

      if (!parentComment || parentComment.taskId !== taskId) {
        return { success: false, error: "Parent comment not found." };
      }
      parentAuthorClerkId = parentComment.authorId;
    }

    const trimmedContent = validated.data.content.trim();

    const newComment = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(comments)
        .values({
          taskId,
          authorId: user.clerkId,
          content: trimmedContent,
          parentCommentId: parentCommentId || null,
        })
        .returning();

      const recipientsToNotify = new Set<string>();

      if (parentCommentId && parentAuthorClerkId) {
        const [parentAuthorUser] = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, parentAuthorClerkId));

        if (parentAuthorUser?.id && parentAuthorUser.id !== user.id) {
          recipientsToNotify.add(parentAuthorUser.id);
        }
      } else if (!parentCommentId && taskCtx.assigneeId) {
        if (taskCtx.assigneeId !== user.id) {
          recipientsToNotify.add(taskCtx.assigneeId);
        }
      }

      for (const recipientId of recipientsToNotify) {
        const projectSlug = toSlug(taskCtx.projectName);
        await tx.insert(notifications).values({
          workspaceId: taskCtx.workspaceId || null,
          recipientId,
          actorId: user.id,
          type: "comment_added",
          title: "New Comment",
          message: `${user.name} commented on "${taskCtx.taskTitle}".`,
          href: `/projects/${projectSlug}#comment-${inserted.id}`,
          metadata: {
            taskId,
            commentId: inserted.id,
            projectId: taskCtx.projectId,
            projectSlug,
          },
        });
      }

      return inserted;
    });

    const projectSlug = toSlug(taskCtx.projectName);
    revalidatePath(`/projects/${projectSlug}`);
    revalidatePath(`/projects/${taskCtx.projectId}`);

    const resultRecord: CommentRecord = {
      ...newComment,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        clerkId: user.clerkId,
      },
      replies: [],
    };

    return { success: true, comment: resultRecord };
  } catch (error) {
    console.error("[createCommentAction] Error:", error);
    return { success: false, error: "Failed to post comment. Please try again." };
  }
}

/* =========================================================================
   2. GET TASK COMMENTS
   ========================================================================= */
export async function getTaskCommentsAction(taskId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in.", comments: [] };

    const taskCtx = await getTaskProjectContext(taskId);
    if (!taskCtx) return { success: false, error: "Task not found.", comments: [] };

    const hasAccess = await assertProjectAccess(taskCtx.projectId, user.id);
    if (!hasAccess) return { success: false, error: "Access denied.", comments: [] };

    const rows = await db
      .select({
        id: comments.id,
        taskId: comments.taskId,
        authorId: comments.authorId,
        content: comments.content,
        parentCommentId: comments.parentCommentId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        authorDbId: users.id,
        authorName: users.name,
        authorEmail: users.email,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.clerkId))
      .where(eq(comments.taskId, taskId))
      .orderBy(asc(comments.createdAt));

    const commentMap = new Map<string, CommentRecord>();
    const topLevelComments: CommentRecord[] = [];

    for (const r of rows) {
      const rec: CommentRecord = {
        id: r.id,
        taskId: r.taskId,
        authorId: r.authorId,
        author:
          r.authorDbId && r.authorName
            ? {
                id: r.authorDbId,
                name: r.authorName,
                email: r.authorEmail || "",
                clerkId: r.authorId,
              }
            : null,
        content: r.content,
        parentCommentId: r.parentCommentId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        replies: [],
      };
      commentMap.set(r.id, rec);
    }

    for (const rec of commentMap.values()) {
      if (!rec.parentCommentId) {
        topLevelComments.push(rec);
      } else {
        let ancestor = commentMap.get(rec.parentCommentId);
        const visited = new Set<string>([rec.id]);
        while (ancestor?.parentCommentId && !visited.has(ancestor.id)) {
          visited.add(ancestor.id);
          const next = commentMap.get(ancestor.parentCommentId);
          if (!next) break;
          ancestor = next;
        }
        if (ancestor) {
          ancestor.replies.push(rec);
        } else {
          topLevelComments.push(rec);
        }
      }
    }

    return { success: true, comments: topLevelComments };
  } catch (error) {
    console.error("[getTaskCommentsAction] Error:", error);
    return { success: false, error: "Failed to fetch comments.", comments: [] };
  }
}

/* =========================================================================
   3. UPDATE COMMENT
   ========================================================================= */
export async function updateCommentAction(commentId: string, content: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = updateCommentSchema.safeParse({ id: commentId, content });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid comment data",
      };
    }

    const [existing] = await db
      .select({
        id: comments.id,
        authorId: comments.authorId,
        taskId: comments.taskId,
        content: comments.content,
      })
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!existing) return { success: false, error: "Comment not found." };
    if (existing.authorId !== user.clerkId) {
      return { success: false, error: "You can only edit your own comments." };
    }
    if (existing.content === "[deleted]") {
      return { success: false, error: "Cannot edit a deleted comment." };
    }

    const [updated] = await db
      .update(comments)
      .set({
        content: validated.data.content.trim(),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

    const taskCtx = await getTaskProjectContext(existing.taskId);
    if (taskCtx) {
      const projectSlug = toSlug(taskCtx.projectName);
      revalidatePath(`/projects/${projectSlug}`);
      revalidatePath(`/projects/${taskCtx.projectId}`);
    }

    return { success: true, comment: updated };
  } catch (error) {
    console.error("[updateCommentAction] Error:", error);
    return { success: false, error: "Failed to update comment." };
  }
}

/* =========================================================================
   4. DELETE COMMENT
   ========================================================================= */
export async function deleteCommentAction(commentId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const validated = deleteCommentSchema.safeParse({ id: commentId });
    if (!validated.success) {
      return { success: false, error: "Invalid comment ID." };
    }

    const [existing] = await db
      .select({
        id: comments.id,
        authorId: comments.authorId,
        taskId: comments.taskId,
        parentCommentId: comments.parentCommentId,
        content: comments.content,
      })
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!existing) return { success: false, error: "Comment not found." };

    const taskCtx = await getTaskProjectContext(existing.taskId);
    if (!taskCtx) return { success: false, error: "Task not found." };

    const isAuthor = existing.authorId === user.clerkId;
    const canManage = await checkCanManageProject(taskCtx.projectId, user.id);

    if (!isAuthor && !canManage) {
      return { success: false, error: "Unauthorized. You cannot delete this comment." };
    }

    const [hasReplies] = await db
      .select({ id: comments.id })
      .from(comments)
      .where(eq(comments.parentCommentId, commentId))
      .limit(1);

    if (hasReplies) {
      await db
        .update(comments)
        .set({
          content: "[deleted]",
          updatedAt: new Date(),
        })
        .where(eq(comments.id, commentId));
    } else {
      await db.delete(comments).where(eq(comments.id, commentId));
    }

    const projectSlug = toSlug(taskCtx.projectName);
    revalidatePath(`/projects/${projectSlug}`);
    revalidatePath(`/projects/${taskCtx.projectId}`);

    return { success: true, softDeleted: Boolean(hasReplies) };
  } catch (error) {
    console.error("[deleteCommentAction] Error:", error);
    return { success: false, error: "Failed to delete comment." };
  }
}
