import { z } from "zod";

/* ─────────────────────────────────────────────────────────────
   Workspace schemas
───────────────────────────────────────────────────────────── */
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name must be under 100 characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = createWorkspaceSchema.extend({
  id: z.string().uuid("Invalid workspace ID"),
});

export type UpdateWorkspaceFormValues = z.infer<typeof updateWorkspaceSchema>;

/* ─────────────────────────────────────────────────────────────
   Team schemas (scoped under workspace module — workspace.ts
   is the owner of these per the task structure)
───────────────────────────────────────────────────────────── */
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .min(2, "Team name must be at least 2 characters")
    .max(60, "Team name must be under 60 characters"),
  description: z
    .string()
    .max(300, "Description must be under 300 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

/* ─────────────────────────────────────────────────────────────
   Workspace member invite schema
   invite_status is a pgEnum — values must match exactly:
   ["pending", "accepted", "expired", "revoked"]
   Zod v4: use { message } shorthand for enum error messages
───────────────────────────────────────────────────────────── */
export const INVITE_STATUSES = ["pending", "accepted", "expired", "revoked"] as const;
export const WORKSPACE_MEMBER_ROLES = ["owner", "admin", "member"] as const;

export type InviteStatus = (typeof INVITE_STATUSES)[number];
export type WorkspaceMemberRole = (typeof WORKSPACE_MEMBER_ROLES)[number];

export const inviteMemberSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  role: z.enum(WORKSPACE_MEMBER_ROLES, {
    message: `Role must be one of: ${WORKSPACE_MEMBER_ROLES.join(", ")}`,
  }),
  workspaceId: z.string().uuid("Invalid workspace ID"),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
