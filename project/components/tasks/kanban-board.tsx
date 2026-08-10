"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Loader2 } from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { ProjectDetailSkeleton, BoardTabSkeleton } from "@/components/projects/details/skeleton-loading";
import type { TaskRecord } from "@/app/actions/task-actions";

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
    createList,
    setDraggedTask,
  } = useBoardStore();

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    loadProject(projectId);
  }, [projectId, loadProject]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function tasksForList(listId: string) {
    return tasks.filter((t) => t.listId === listId).sort((a, b) => a.position - b.position);
  }

  function findListOfTask(taskId: string): string | null {
    return tasks.find((t) => t.id === taskId)?.listId ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setDraggedTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggedTask(null);
    if (!over) return;

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
  if (isLoading) {
    return <BoardTabSkeleton />;
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
                    if (e.key === "Escape") { setIsAddingList(false); setNewListName(""); }
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
                    onClick={() => { setIsAddingList(false); setNewListName(""); }}
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
          {draggedTask ? <TaskCard task={draggedTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
