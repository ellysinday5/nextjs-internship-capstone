import { z } from "zod";

/* ─────────────────────────────────────────────────────────────
   List (Kanban column) schemas
───────────────────────────────────────────────────────────── */
export const createListSchema = z.object({
  name: z
    .string()
    .min(1, "List name is required")
    .max(100, "List name must be under 100 characters"),
  projectId: z.string().uuid("Invalid project ID"),
});

export type CreateListFormValues = z.infer<typeof createListSchema>;

export const updateListSchema = z.object({
  id: z.string().uuid("Invalid list ID"),
  name: z
    .string()
    .min(1, "List name is required")
    .max(100, "List name must be under 100 characters")
    .optional(),
});

export type UpdateListFormValues = z.infer<typeof updateListSchema>;

export const reorderListsSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  orderedIds: z
    .array(z.string().uuid("Each list ID must be a valid UUID"))
    .min(1, "At least one list ID is required"),
});

export type ReorderListsFormValues = z.infer<typeof reorderListsSchema>;
