import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().min(1, "List name is required").max(100),
  projectId: z.string().uuid("Invalid project ID"),
});

export const updateListSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "List name is required").max(100).optional(),
});

export const reorderListsSchema = z.object({
  projectId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type CreateListFormValues = z.infer<typeof createListSchema>;
export type UpdateListFormValues = z.infer<typeof updateListSchema>;
export type ReorderListsFormValues = z.infer<typeof reorderListsSchema>;