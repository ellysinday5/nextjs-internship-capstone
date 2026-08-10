"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getListsAction, createListAction, deleteListAction, type ListWithTasks } from "@/app/actions/list-actions";
import {
  getProjectTasksAction,
  createTaskAction,
  updateTaskAction,
  moveTaskAction,
  deleteTaskAction,
  type TaskRecord,
} from "@/app/actions/task-actions";
import type { CreateTaskFormValues, UpdateTaskFormValues } from "@/lib/task-schemas";

interface BoardState {
  currentProjectId: string | null;
  lists: ListWithTasks[];
  tasks: TaskRecord[];
  draggedTask: TaskRecord | null;
  draggedOverList: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadProject: (projectId: string) => Promise<void>;
  createTask: (listId: string, task: Partial<CreateTaskFormValues> & { title: string }) => Promise<void>;
  updateTask: (taskId: string, updates: Omit<UpdateTaskFormValues, "id">) => Promise<void>;
  moveTask: (taskId: string, newListId: string, newPosition: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createList: (name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;

  setDraggedTask: (task: TaskRecord | null) => void;
  setDraggedOverList: (listId: string | null) => void;
}

export const useBoardStore = create<BoardState>()(
  subscribeWithSelector((set, get) => ({
    currentProjectId: null,
    lists: [],
    tasks: [],
    draggedTask: null,
    draggedOverList: null,
    isLoading: false,
    isSaving: false,
    error: null,

    loadProject: async (projectId) => {
      set({ isLoading: true, error: null, currentProjectId: projectId });
      try {
        const [lists, tasks] = await Promise.all([
          getListsAction(projectId),
          getProjectTasksAction(projectId),
        ]);
        set({ lists, tasks, isLoading: false });
      } catch (err) {
        console.error("[board-store] loadProject failed:", err);
        set({ isLoading: false, error: "Failed to load board. Please try again." });
      }
    },

    createTask: async (listId, task) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticTask: TaskRecord = {
        id: tempId,
        title: task.title,
        description: task.description ?? null,
        listId,
        assigneeId: task.assigneeId ?? null,
        assignee: null,
        priority: task.priority ?? null,
        status: task.status ?? "On track",
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        position: get().tasks.filter((t) => t.listId === listId).length,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({ tasks: [...state.tasks, optimisticTask], isSaving: true }));

      const result = await createTaskAction({ ...task, listId } as CreateTaskFormValues);

      if (!result.success || !result.task) {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== tempId),
          isSaving: false,
          error: result.error ?? "Failed to create task.",
        }));
        return;
      }

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === tempId ? { ...result.task!, assignee: null, commentsCount: 0 } : t,
        ),
        isSaving: false,
      }));
    },

    updateTask: async (taskId, updates) => {
      const previousTasks = get().tasks;

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                ...updates,
                dueDate:
                  updates.dueDate === undefined ? t.dueDate : updates.dueDate ? new Date(updates.dueDate) : null,
              }
            : t,
        ),
        isSaving: true,
      }));

      const result = await updateTaskAction({ id: taskId, ...updates });

      if (!result.success) {
        set({ tasks: previousTasks, isSaving: false, error: result.error ?? "Failed to update task." });
        return;
      }
      set({ isSaving: false });
    },

    moveTask: async (taskId, newListId, newPosition) => {
      const previousTasks = get().tasks;

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, listId: newListId, position: newPosition } : t,
        ),
        isSaving: true,
      }));

      const result = await moveTaskAction({ taskId, toListId: newListId, toPosition: newPosition });

      if (!result.success) {
        set({ tasks: previousTasks, isSaving: false, error: result.error ?? "Failed to move task." });
        return;
      }
      set({ isSaving: false });
    },

    deleteTask: async (taskId) => {
      const previousTasks = get().tasks;
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId), isSaving: true }));

      const result = await deleteTaskAction(taskId);

      if (!result.success) {
        set({ tasks: previousTasks, isSaving: false, error: result.error ?? "Failed to delete task." });
        return;
      }
      set({ isSaving: false });
    },

    createList: async (name) => {
      const projectId = get().currentProjectId;
      if (!projectId) return;

      const result = await createListAction({ name, projectId });
      if (!result.success || !result.list) {
        set({ error: result.error ?? "Failed to create list." });
        return;
      }
      set((state) => ({ lists: [...state.lists, { ...result.list!, taskCount: 0 }] }));
    },

    deleteList: async (listId) => {
      const previousLists = get().lists;
      const previousTasks = get().tasks;

      set((state) => ({
        lists: state.lists.filter((l) => l.id !== listId),
        tasks: state.tasks.filter((t) => t.listId !== listId),
      }));

      const result = await deleteListAction(listId);
      if (!result.success) {
        set({ lists: previousLists, tasks: previousTasks, error: result.error ?? "Failed to delete list." });
      }
    },

    setDraggedTask: (task) => set({ draggedTask: task }),
    setDraggedOverList: (listId) => set({ draggedOverList: listId }),
  })),
);