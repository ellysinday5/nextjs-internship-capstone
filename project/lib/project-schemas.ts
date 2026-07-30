import { z } from "zod";

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

export const teamMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  role: z.string().min(1, "Member role is required"),
});

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
  categories: z.array(z.enum(PROJECT_CATEGORIES)).min(1, "Pick at least one category"),
  techStack: z.array(z.string()).min(1, "Add at least one tech stack item"),
  status: z.enum(PROJECT_STATUSES),
  priority: z.enum(PROJECT_PRIORITIES),
  members: z.array(teamMemberSchema).min(1, "Add at least one team member"),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.extend({
  id: z.string().uuid("Invalid project ID"),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
