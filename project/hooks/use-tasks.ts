"use client";

import {
  type TaskRecord,
  createTaskAction,
  deleteTaskAction,
  getProjectTasksAction,
  moveTaskAction,
  updateTaskAction,
} from "@/actions/task-actions";
import type { CreateTaskFormValues, UpdateTaskFormValues } from "@/lib/db/task-schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTasks(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["tasks", projectId];

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery<TaskRecord[]>({
    queryKey,
    queryFn: () => getProjectTasksAction(projectId),
    enabled: !!projectId,
  });

  /* ── Create ── */
  const createMutation = useMutation({
    mutationFn: (data: CreateTaskFormValues) => createTaskAction(data),
    onMutate: async (newTaskData: CreateTaskFormValues) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<TaskRecord[]>(queryKey);

      const optimisticTask: TaskRecord = {
        id: `temp-${Date.now()}`,
        title: newTaskData.title,
        description: newTaskData.description ?? null,
        listId: newTaskData.listId,
        assigneeId: newTaskData.assigneeId ?? null,
        assignee: null,
        priority: newTaskData.priority ?? null,
        status: newTaskData.status ?? null,
        dueDate: newTaskData.dueDate ? new Date(newTaskData.dueDate) : null,
        position: previousTasks?.filter((t) => t.listId === newTaskData.listId).length ?? 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<TaskRecord[]>(queryKey, (old: TaskRecord[] | undefined = []) => [...old, optimisticTask]);
      return { previousTasks };
    },
    onError: (_err: unknown, _newTask: CreateTaskFormValues, context?: { previousTasks?: TaskRecord[] }) => {
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /* ── Update ── */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<UpdateTaskFormValues, "id"> }) =>
      updateTaskAction({ id, ...data }),
    onMutate: async ({ id, data }: { id: string; data: Omit<UpdateTaskFormValues, "id"> }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<TaskRecord[]>(queryKey);

      queryClient.setQueryData<TaskRecord[]>(queryKey, (old: TaskRecord[] | undefined = []) =>
        old.map((t: TaskRecord) =>
          t.id === id
            ? {
                ...t,
                ...data,
                dueDate:
                  data.dueDate === undefined
                    ? t.dueDate
                    : data.dueDate
                      ? new Date(data.dueDate)
                      : null,
              }
            : t,
        ),
      );
      return { previousTasks };
    },
    onError: (_err: unknown, _vars: { id: string; data: Omit<UpdateTaskFormValues, "id"> }, context?: { previousTasks?: TaskRecord[] }) => {
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /* ── Delete ── */
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTaskAction(taskId),
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<TaskRecord[]>(queryKey);

      queryClient.setQueryData<TaskRecord[]>(queryKey, (old = []) =>
        old.filter((t) => t.id !== taskId),
      );
      return { previousTasks };
    },
    onError: (_err: unknown, _taskId: string, context?: { previousTasks?: TaskRecord[] }) => {
      if (context?.previousTasks) queryClient.setQueryData(queryKey, context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /* ── Move (drag between lists / reorder) ──
     No onMutate here — the Zustand board-store already handles
     the instant visual update during drag. This mutation just
     persists the move in the background. */
  const moveMutation = useMutation({
    mutationFn: ({
      taskId,
      toListId,
      toPosition,
    }: {
      taskId: string;
      toListId: string;
      toPosition: number;
    }) => moveTaskAction({ taskId, toListId, toPosition }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    tasks: tasks ?? [],
    isLoading,
    error,

    createTask: (data: CreateTaskFormValues) => createMutation.mutate(data),
    createTaskAsync: (data: CreateTaskFormValues) => createMutation.mutateAsync(data),
    isCreating: createMutation.isPending,

    updateTask: (id: string, data: Omit<UpdateTaskFormValues, "id">) =>
      updateMutation.mutate({ id, data }),
    updateTaskAsync: (id: string, data: Omit<UpdateTaskFormValues, "id">) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,

    deleteTask: (id: string) => deleteMutation.mutate(id),
    deleteTaskAsync: (id: string) => deleteMutation.mutateAsync(id),
    isDeleting: deleteMutation.isPending,

    moveTask: (taskId: string, newListId: string, position: number) =>
      moveMutation.mutate({ taskId, toListId: newListId, toPosition: position }),
    isMoving: moveMutation.isPending,
  };
}
