// Import VALID_STATUSES from task-status to keep a single source of truth.
// deriveStatusForList (used by Kanban auto-derivation) and Zod validation
// both reference the same array — they can never drift apart.
import { VALID_STATUSES } from "@/lib/task-status";
import { z } from "zod";

/* ─────────────────────────────────────────────────────────────
   Constants — sourced from DB schema (plain text columns, no pgEnum)
───────────────────────────────────────────────────────────── */
export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;

// Re-export so consumers can import either from here or from @/lib/task-status
export { VALID_STATUSES as TASK_STATUS_VALUES };

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/* ─────────────────────────────────────────────────────────────
   createTaskSchema
   status and priority are optional on creation because:
   - status: auto-derived by deriveStatusForList when task is placed
     into a Kanban column; createTaskAction falls back to "On track"
     when status is absent (see actions/task-actions.ts line 171).
   - priority: not required at creation time in the UI.
───────────────────────────────────────────────────────────── */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be under 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be under 2000 characters")
    .optional()
    .nullable(),
  listId: z.string().uuid("Invalid list ID"),
  assigneeId: z.string().uuid("Invalid assignee ID").optional().nullable(),
  // Zod v4: use { message } for simple custom messages on enum
  priority: z
    .enum(TASK_PRIORITIES, {
      message: `Priority must be one of: ${TASK_PRIORITIES.join(", ")}`,
    })
    .optional()
    .nullable(),
  status: z
    .enum(VALID_STATUSES, {
      message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    })
    .optional()
    .nullable(),
  dueDate: z.string().optional().nullable(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

/* ─────────────────────────────────────────────────────────────
   updateTaskSchema — all fields except id are optional (PATCH semantics)
───────────────────────────────────────────────────────────── */
export const updateTaskSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be under 200 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be under 2000 characters")
    .optional()
    .nullable(),
  assigneeId: z.string().uuid("Invalid assignee ID").optional().nullable(),
  priority: z
    .enum(TASK_PRIORITIES, {
      message: `Priority must be one of: ${TASK_PRIORITIES.join(", ")}`,
    })
    .optional()
    .nullable(),
  status: z
    .enum(VALID_STATUSES, {
      message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    })
    .optional()
    .nullable(),
  dueDate: z.string().optional().nullable(),
});

export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

/* ─────────────────────────────────────────────────────────────
   moveTaskSchema — used by drag-and-drop and keyboard reorder
   Zod v4: z.number() params use { message } not { invalid_type_error }
───────────────────────────────────────────────────────────── */
export const moveTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  toListId: z.string().uuid("Invalid destination list ID"),
  toPosition: z
    .number({ message: "Position must be a number" })
    .int("Position must be an integer")
    .min(0, "Position must be 0 or greater"),
});

export type MoveTaskFormValues = z.infer<typeof moveTaskSchema>;
