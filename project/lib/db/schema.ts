import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
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
  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  authorId: text("author_id").notNull(),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id").references((): AnyPgColumn => comments.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =====================================