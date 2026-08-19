import { z } from "zod";

/* ─────────────────────────────────────────────────────────────
   Constants — sourced from DB schema (plain text columns, no pgEnum)
   These are the canonical values used across the codebase.
───────────────────────────────────────────────────────────── */
export const PROJECT_CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Mobile",
  "Design",
] as const;

export const PROJECT_STATUSES = ["Not Started", "In Progress", "Completed", "On Hold"] as const;

export const PROJECT_PRIORITIES = ["Low", "Medium", "High"] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

/* ─────────────────────────────────────────────────────────────
   Team Member schema (used inside createProjectSchema)
───────────────────────────────────────────────────────────── */
export const teamMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  role: z.string().min(1, "Member role is required"),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

/* ─────────────────────────────────────────────────────────────
   Project schemas
   NOTE: categories uses z.array(z.string()) — NOT z.enum(PROJECT_CATEGORIES)
   because CategoryProvider (context/category-context.tsx) allows
   user-customized categories stored in localStorage beyond the
   default PROJECT_CATEGORIES preset list.
───────────────────────────────────────────────────────────── */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be under 100 characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "Pick at least one category"),
  techStack: z.array(z.string()).min(1, "Add at least one tech stack item"),
  // Zod v4: use { message } for simple custom messages on enum
  status: z.enum(PROJECT_STATUSES, {
    message: `Status must be one of: ${PROJECT_STATUSES.join(", ")}`,
  }),
  priority: z.enum(PROJECT_PRIORITIES, {
    message: `Priority must be one of: ${PROJECT_PRIORITIES.join(", ")}`,
  }),
  members: z.array(teamMemberSchema).min(1, "Add at least one team member"),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.extend({
  id: z.string().uuid("Invalid project ID"),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
