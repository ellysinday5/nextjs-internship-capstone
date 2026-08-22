"use client";

import type { ListWithTasks } from "@/actions/list-actions";
import type { TaskRecord } from "@/actions/task-actions";
import { BoardTabSkeleton } from "@/components/projects/details/skeleton-loading";
import { createKanbanCoordinateGetter } from "@/lib/kanban-keyboard";
import { useBoardStore } from "@/stores/board-store";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";

interface KanbanBoardProps {
  projectId: string;
  onSelectTask?: (task: TaskRecord) => void;
}

export function KanbanBoard({ projectId, onSelectTask }: KanbanBoardProps) {
  const {
    lists,
    tasks,
    isLoading,
    isSaving,
    error,
    draggedTask,
    loadProject,
    moveTask,
    reorderLists,
    createList,
    setDraggedTask,
  } = useBoardStore();

  const [draggedColumn, setDraggedColumn] = useState<ListWithTasks | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    loadProject(projectId);
  }, [projectId, loadProject]);

  const keyboardCoordinateGetter = createKanbanCoordinateGetter(() => ({
    tasks: tasks.map((t) => ({ id: t.id, listId: t.listId, position: t.position })),
    lists: lists.map((l) => ({ id: l.id })),
  }));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function tasksForList(listId: string) {
    return tasks.filter((t) => t.listId === listId).sort((a, b) => a.position - b.position);
  }

  function findListOfTask(taskId: string): string | null {
    return tasks.find((t) => t.id === taskId)?.listId ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    const activeData = event.active.data.current;
    if (activeData?.type === "column") {
      const col = lists.find((l) => l.id === event.active.id);
      setDraggedColumn(col ?? null);
      return;
    }

    const task = tasks.find((t) => t.id === event.active.id);
    setDraggedTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggedTask(null);
    setDraggedColumn(null);
    if (!over) return;

    const activeType = active.data.current?.type;

    // Handle column reordering
    if (activeType === "column") {
      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId !== overId) {
        const oldIndex = lists.findIndex((l) => l.id === activeId);
        const newIndex = lists.findIndex((l) => l.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(lists, oldIndex, newIndex);
          reorderLists(newOrder.map((l) => l.id));
        }
      }
      return;
    }

    // Handle task movement
    const taskId = active.id as string;
    const fromListId = findListOfTask(taskId);
    const toListId = (over.data.current?.listId as string) ?? findListOfTask(over.id as string);
    if (!fromListId || !toListId) return;

    const destTasks = tasksForList(toListId).filter((t) => t.id !== taskId);
    const overIndex = destTasks.findIndex((t) => t.id === over.id);
    const newPosition = overIndex === -1 ? destTasks.length : overIndex;

    if (fromListId === toListId) {
      const fromIndex = tasksForList(fromListId).findIndex((t) => t.id === taskId);
      if (fromIndex === newPosition) return;
    }

    moveTask(taskId, toListId, newPosition);
  }

  async function handleAddList() {
    if (!newListName.trim()) return;
    await createList(newListName.trim());
    setNewListName("");
    setIsAddingList(false);
  }

  /* ── Loading / error states ── */
  if (isLoading && lists.length === 0) {
    const DEFAULT_PREVIEW_COLS = ["To Do", "In Progress", "Review", "Done"];
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0f1d31]">
        <div className="flex flex-1 items-start gap-3 overflow-x-auto overflow-y-auto p-5 pb-8">
          {DEFAULT_PREVIEW_COLS.map((name, i) => (
            <div
              key={i}
              className="flex w-[272px] flex-shrink-0 flex-col rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-[#f5f6f7] dark:bg-[#14263e]/70"
            >
              <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{name}</span>
                <span className="text-[11px] font-semibold text-slate-400">0</span>
              </div>
              <div className="flex flex-col gap-2 px-2.5 pb-2 min-h-[48px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0f1d31]">
      {/* Saving pill */}
      {isSaving && (
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-[#00b4d8]/5 px-6 py-1 text-[11px] font-semibold text-[#00b4d8] dark:border-slate-800 dark:bg-[#00b4d8]/10">
          <Loader2 size={11} className="animate-spin" />
          Saving…
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Board scroll container */}
        <div className="flex flex-1 items-start gap-3 overflow-x-auto overflow-y-auto p-5 pb-8">
          <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <SortableContext
                key={list.id}
                items={tasksForList(list.id).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  list={list}
                  tasks={tasksForList(list.id)}
                  onSelectTask={onSelectTask}
                />
              </SortableContext>
            ))}
          </SortableContext>

          {/* ── Add section column ── */}
          <div className="w-[272px] flex-shrink-0">
            {isAddingList ? (
              <div className="rounded-xl border border-slate-200 bg-[#f5f6f7] p-3 dark:border-slate-700 dark:bg-[#14263e]/70">
                <input
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddList();
                    if (e.key === "Escape") {
                      setIsAddingList(false);
                      setNewListName("");
                    }
                  }}
                  placeholder="Section name…"
                  className="mb-2.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddList}
                    className="rounded-lg bg-[#0f2d5a] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0c2447] transition-colors"
                  >
                    Add section
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListName("");
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-transparent px-3 py-2.5 text-sm font-semibold text-slate-400 transition-all hover:border-[#00b4d8] hover:bg-[#00b4d8]/5 hover:text-[#00b4d8] dark:border-slate-600 dark:hover:border-[#00b4d8] dark:hover:bg-[#00b4d8]/10"
              >
                <Plus size={15} />
                Add section
              </button>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {draggedColumn ? (
            <div className="opacity-80 rotate-1 shadow-2xl">
              <KanbanColumn
                list={draggedColumn}
                tasks={tasksForList(draggedColumn.id)}
                onSelectTask={onSelectTask}
              />
            </div>
          ) : draggedTask ? (
            <TaskCard task={draggedTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
