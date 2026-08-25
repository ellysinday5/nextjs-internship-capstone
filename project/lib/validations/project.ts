import { z } from "zod";

/* ─────────────────────────────────────────────────────────────
   Constants — sourced from DB schema (plain text columns, no pgEnum)
   These are the canonical values used across the codebase.
───────────────────────────────────────────────────────────── */
export const PROJECT_STATUSES = ["Not Started", "In Progress", "Completed", "On Hold"] as const;

export const PROJECT_PRIORITIES = ["Low", "Medium", "High"] as const;

export const PROJECT_VIEWS = [
  "list",
  "board",
  "timeline",
  "calendar",
  "dashboard",
  "gantt",
  "overview",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];
export type ProjectView = (typeof PROJECT_VIEWS)[number];

/* ─────────────────────────────────────────────────────────────
   Team Member schema (used inside createProjectSchema)
───────────────────────────────────────────────────────────── */
export const teamMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  role: z.string().min(1, "Member role is required"),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

/* ─────────────────────────────────────────────────────────────
   Shared optional fields re-used by both schemas
───────────────────────────────────────────────────────────── */
const sharedProjectFields = {
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  techStack: z.array(z.string()).optional(),
  status: z
    .enum(PROJECT_STATUSES, {
      message: `Status must be one of: ${PROJECT_STATUSES.join(", ")}`,
    })
    .optional(),
  priority: z
    .enum(PROJECT_PRIORITIES, {
      message: `Priority must be one of: ${PROJECT_PRIORITIES.join(", ")}`,
    })
    .optional(),
  members: z.array(teamMemberSchema).optional(),
};

/* ─────────────────────────────────────────────────────────────
   Create Project schema
   - views is REQUIRED and must be a non-empty array of valid ProjectView
     values. Omitting the field OR passing an empty array fails at parse time.
───────────────────────────────────────────────────────────── */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be under 100 characters"),
  ...sharedProjectFields,
  views: z
    .array(z.enum(PROJECT_VIEWS))
    .min(1, "Select at least one view"),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

/* ─────────────────────────────────────────────────────────────
   Update Project schema
   - views is OPTIONAL here — an edit operation might not change views at all.
     But if provided it must still be a non-empty array of valid values.
───────────────────────────────────────────────────────────── */
export const updateProjectSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
  name: z
    .string()
    .min(1, "Project name is required")
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be under 100 characters"),
  ...sharedProjectFields,
  views: z.array(z.enum(PROJECT_VIEWS)).min(1, "Select at least one view").optional(),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
