import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================
export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);

export const workspaceMemberRoleEnum = pgEnum("workspace_member_role", [
  "owner",
  "admin",
  "member",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "project_invite",
  "invite_accepted",
  "task_assigned",
  "task_status_changed",
  "comment_added",
  "mentioned",
  "member_added",
  "password_changed",
  "workspace_invite",
]);

// ============================================
// USERS
// ============================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// WORKSPACES
// ============================================
export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    ownerId: uuid("owner_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    // Index on ownerId so "all workspaces for this user" queries are fast
    index("workspaces_owner_id_idx").on(t.ownerId),
  ],
);

// ============================================
// PROJECTS
// ============================================
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  // Nullable for now — backfill happens in Step 2
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
  dueDate: timestamp("due_date"),
  categories: text("categories").array().notNull().default([]),
  techStack: text("tech_stack").array().notNull().default([]),
  status: text("status").notNull().default("Not Started"),
  priority: text("priority").notNull().default("Medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// WORKSPACE MEMBERS
// ============================================
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: workspaceMemberRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    // Prevent duplicate memberships for the same user in the same workspace
    uniqueIndex("workspace_members_workspace_user_uidx").on(t.workspaceId, t.userId),
    // Index for "all members in this workspace" queries
    index("workspace_members_workspace_id_idx").on(t.workspaceId),
    // Index for "all workspaces this user belongs to" queries
    index("workspace_members_user_id_idx").on(t.userId),
  ],
);

// ============================================
// PROJECT MEMBERS
// (updated: now links to a real user via userId, instead of
// just storing a static name/role string)
// ============================================
export const projectMembers = pgTable("project_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // nullable
  name: text("name").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// LISTS
// ============================================
export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// TASKS
// ============================================
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  listId: uuid("list_id")
    .references(() => lists.id, { onDelete: "cascade" })
    .notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  priority: text("priority"),
  status: text("status").default("On track"),
  dueDate: timestamp("due_date"),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// COMMENTS
// ============================================
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// INVITES (new: team/project invite by email)
// ============================================
export const invites = pgTable("invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  invitedBy: uuid("invited_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  status: inviteStatusEnum("status").notNull().default("pending"),
  role: text("role").notNull().default("member"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// ============================================
// NOTIFICATIONS
// ============================================
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  recipientId: uuid("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  href: text("href"),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// RELATIONS
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
  ownedProjects: many(projects),
  ownedWorkspaces: many(workspaces),
  projectMemberships: many(projectMembers),
  workspaceMemberships: many(workspaceMembers),
  assignedTasks: many(tasks),
  comments: many(comments),
  sentInvites: many(invites),
  receivedNotifications: many(notifications, { relationName: "recipientNotifications" }),
  sentNotifications: many(notifications, { relationName: "actorNotifications" }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  projects: many(projects),
  notifications: many(notifications),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  members: many(projectMembers),
  lists: many(lists),
  invites: many(invites),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  project: one(projects, {
    fields: [lists.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const invitesRelations = relations(invites, ({ one }) => ({
  project: one(projects, {
    fields: [invites.projectId],
    references: [projects.id],
  }),
  inviter: one(users, {
    fields: [invites.invitedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [notifications.workspaceId],
    references: [workspaces.id],
  }),
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
    relationName: "recipientNotifications",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "actorNotifications",
  }),
}));
