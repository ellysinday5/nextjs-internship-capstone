"use client";

import {
  type ListWithTasks,
  createListAction,
  deleteListAction,
  getListsAction,
  reorderListsAction,
  updateListAction,
} from "@/actions/list-actions";
import {
  type TaskRecord,
  createTaskAction,
  deleteTaskAction,
  getProjectTasksAction,
  moveTaskAction,
  updateTaskAction,
} from "@/actions/task-actions";
import type { CreateTaskFormValues, UpdateTaskFormValues } from "@/lib/db/task-schemas";
import { deriveStatusForList } from "@/lib/task-status";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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
  createTask: (
    listId: string,
    task: Partial<CreateTaskFormValues> & { title: string },
  ) => Promise<void>;
  updateTask: (taskId: string, updates: Omit<UpdateTaskFormValues, "id">) => Promise<void>;
  moveTask: (taskId: string, newListId: string, newPosition: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  renameList: (listId: string, name: string) => Promise<void>;
  reorderLists: (orderedIds: string[]) => Promise<void>;
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
      if (
        get().currentProjectId === projectId &&
        (get().lists.length > 0 || get().tasks.length > 0)
      ) {
        return;
      }
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
        completedAt: null,
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
          t.id === tempId
            ? {
                ...result.task!,
                assignee: result.task!.assignee ?? null,
                commentsCount: result.task!.commentsCount ?? 0,
              }
            : t,
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
                  updates.dueDate === undefined
                    ? t.dueDate
                    : updates.dueDate
                      ? new Date(updates.dueDate)
                      : null,
              }
            : t,
        ),
        isSaving: true,
      }));

      const result = await updateTaskAction({ id: taskId, ...updates });

      if (!result.success) {
        set({
          tasks: previousTasks,
          isSaving: false,
          error: result.error ?? "Failed to update task.",
        });
        return;
      }
      set({ isSaving: false });
    },

    moveTask: async (taskId, newListId, newPosition) => {
      const previousTasks = get().tasks;
      const { lists } = get();

      const targetList = lists.find((l) => l.id === newListId);
      const derivedStatus = targetList ? deriveStatusForList(targetList, lists) : undefined;

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                listId: newListId,
                position: newPosition,
                ...(derivedStatus ? { status: derivedStatus } : {}),
              }
            : t,
        ),
        isSaving: true,
      }));

      const moveResult = await moveTaskAction({
        taskId,
        toListId: newListId,
        toPosition: newPosition,
      });

      if (!moveResult.success) {
        set({
          tasks: previousTasks,
          isSaving: false,
          error: moveResult.error ?? "Failed to move task.",
        });
        return;
      }

      if (derivedStatus) {
        const statusResult = await updateTaskAction({ id: taskId, status: derivedStatus });
        if (!statusResult.success) {
          set({
            isSaving: false,
            error: statusResult.error ?? "Task moved, but failed to update status.",
          });
          return;
        }
      }

      set({ isSaving: false });
    },

    deleteTask: async (taskId) => {
      const previousTasks = get().tasks;
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId), isSaving: true }));

      const result = await deleteTaskAction(taskId);

      if (!result.success) {
        set({
          tasks: previousTasks,
          isSaving: false,
          error: result.error ?? "Failed to delete task.",
        });
        return;
      }
      set({ isSaving: false });
    },

    renameList: async (listId, name) => {
      const previousLists = get().lists;
      set((state) => ({
        lists: state.lists.map((l) => (l.id === listId ? { ...l, name } : l)),
      }));

      const result = await updateListAction({ id: listId, name });
      if (!result.success) {
        set({ lists: previousLists, error: result.error ?? "Failed to rename section." });
      }
    },

    reorderLists: async (orderedIds) => {
      const previousLists = get().lists;
      const projectId = get().currentProjectId;
      if (!projectId) return;

      const idToPos = new Map(orderedIds.map((id, index) => [id, index]));
      const newLists = [...previousLists].sort(
        (a, b) => (idToPos.get(a.id) ?? a.position) - (idToPos.get(b.id) ?? b.position),
      );

      set({ lists: newLists });

      const result = await reorderListsAction({ projectId, orderedIds });
      if (!result.success) {
        set({ lists: previousLists, error: result.error ?? "Failed to reorder sections." });
      }
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
        set({
          lists: previousLists,
          tasks: previousTasks,
          error: result.error ?? "Failed to delete list.",
        });
      }
    },

    setDraggedTask: (task) => set({ draggedTask: task }),
    setDraggedOverList: (listId) => set({ draggedOverList: listId }),
  })),
);
