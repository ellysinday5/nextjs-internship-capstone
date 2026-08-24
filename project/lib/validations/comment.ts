import { z } from "zod";

/* ─────────────────────────────────────────────────────────────
   Comment schemas
───────────────────────────────────────────────────────────── */
export const createCommentSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be under 2000 characters"),
  parentCommentId: z.string().uuid("Invalid parent comment ID").optional(),
});

export type CreateCommentFormValues = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  id: z.string().uuid("Invalid comment ID"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be under 2000 characters"),
});

export type UpdateCommentFormValues = z.infer<typeof updateCommentSchema>;

export const deleteCommentSchema = z.object({
  id: z.string().uuid("Invalid comment ID"),
});

export type DeleteCommentFormValues = z.infer<typeof deleteCommentSchema>;
