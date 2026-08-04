import { z } from "zod"

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
})

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>