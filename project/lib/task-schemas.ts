import { z } from "zod";

const STATUS_VALUES = [
  "On track",
  "At risk",
  "Off track",
  "On hold",
  "Complete",
  "Dropped",
] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(2000).optional(),
  listId: z.string().uuid("Invalid list ID"),
  assigneeId: z.string().uuid().optional().nullable(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  status: z.enum(STATUS_VALUES).optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  status: z.enum(STATUS_VALUES).optional(),
  dueDate: z.string().optional().nullable(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().uuid(),
  toListId: z.string().uuid(),
  toPosition: z.number().int().min(0),
  status: z.enum(STATUS_VALUES).optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;
export type MoveTaskFormValues = z.infer<typeof moveTaskSchema>;
