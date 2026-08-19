export {
  notificationTypeEnum,
  notifications,
  notificationsRelations,
} from "./schema";

import type { notifications } from "./schema";

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
