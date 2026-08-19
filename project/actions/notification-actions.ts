"use server";

import { db } from "@/lib/db";
import { type notificationTypeEnum, notifications } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { type InferSelectModel, and, count, eq } from "drizzle-orm";

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

export type NotificationWithActor = InferSelectModel<typeof notifications> & {
  actor: { id: string; name: string; email: string } | null;
};
