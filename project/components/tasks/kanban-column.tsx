"use client";

<<<<<<< HEAD
import type { ListWithTasks } from "@/actions/list-actions";
import type { TaskRecord } from "@/actions/task-actions";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useBoardStore } from "@/stores/board-store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
=======
import type { ListWithTasks } from "@/app/actions/list-actions";
import type { TaskRecord } from "@/app/actions/task-actions";
import { useBoardStore } from "@/stores/board-store";
import { useDroppable } from "@dnd-kit/core";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
import { SortableTaskCard } from "./task-card";

interface KanbanColumnProps {
  list: ListWithTasks;
  tasks: TaskRecord[];
  onSelectTask?: (task: TaskRecord) => void;
}

<<<<<<< HEAD
=======
/* Stable accent colour per list — persists across re-renders via module-level map */
const ACCENTS = [
  "#00b4d8",
  "#1985a1",
  "#6366f1",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#0f2d5a",
];
let _idx = 0;
const _colorMap = new Map<string, string>();
function accentFor(id: string) {
  if (!_colorMap.has(id)) {
    _colorMap.set(id, ACCENTS[_idx++ % ACCENTS.length]);
  }
  return _colorMap.get(id)!;
}

>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
export function KanbanColumn({ list, tasks, onSelectTask }: KanbanColumnProps) {
  const { deleteList, renameList } = useBoardStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(list.name);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "column", listId: list.id },
  });

  useEffect(() => {
    setEditedName(list.name);
  }, [list.name]);

  useEffect(() => {
    if (isEditingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingName]);

  const handleSaveName = async () => {
    setIsEditingName(false);
    const trimmed = editedName.trim();
    if (!trimmed || trimmed === list.name) {
      setEditedName(list.name);
      return;
    }
    await renameList(list.id, trimmed);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
<<<<<<< HEAD
    <>
      <div
        ref={setNodeRef}
        data-list-dropzone={list.id}
        className="flex w-[272px] flex-shrink-0 flex-col rounded-xl bg-[#f5f6f7] dark:bg-[#14263e]/70 border border-slate-200/80 dark:border-slate-700/50"
      >
        {/* ── Column header ── */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 group/header">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Column Drag Handle */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 rounded transition-colors opacity-0 group-hover/header:opacity-100"
              title="Drag column"
              aria-label="Drag column"
            >
              <GripVertical size={14} />
            </button>

            {isEditingName ? (
              <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setEditedName(list.name);
                    setIsEditingName(false);
                  }
                }}
                className="w-full text-sm font-bold bg-white dark:bg-slate-900 border border-[#00b4d8] rounded-md px-2 py-0.5 text-slate-800 dark:text-slate-100 outline-none"
              />
            ) : (
              <h3
                onDoubleClick={() => setIsEditingName(true)}
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate cursor-pointer hover:text-[#00b4d8] transition-colors"
                title="Double click to rename"
=======
    <div
      ref={setNodeRef}
      className="flex w-[272px] flex-shrink-0 flex-col rounded-xl bg-[#f5f6f7] dark:bg-[#14263e]/70 border border-slate-200/80 dark:border-slate-700/50"
    >
      {/* ── Column header ── */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{list.name}</h3>
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
            {tasks.length}
          </span>
        </div>

        {/* column menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            style={{ opacity: menuOpen ? 1 : undefined }}
            className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-white hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800"
            aria-label="Column options"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full z-30 mt-1 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-[#1a2f4a]"
            >
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await deleteList(list.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
              >
                {list.name}
              </h3>
            )}

            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0">
              {tasks.length}
            </span>
          </div>

          {/* Column menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              style={{ opacity: menuOpen ? 1 : undefined }}
              className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-white hover:text-slate-600 group-hover/header:opacity-100 dark:hover:bg-slate-800"
              aria-label="Column options"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full z-30 mt-1 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-[#1a2f4a]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditingName(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Pencil size={12} /> Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Task cards ── */}
        <div className="flex flex-col gap-2 px-2.5 pb-2.5 min-h-[48px]">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onSelect={onSelectTask} />
          ))}
        </div>
      </div>

<<<<<<< HEAD
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setShowDeleteModal(false);
          await deleteList(list.id);
        }}
        variant="delete"
        title="Delete section?"
        description={`Are you sure you want to delete "${list.name}" and all its tasks? This action cannot be undone.`}
        showCloseButton={false}
      />
    </>
=======
      {/* ── Task cards ── */}
      <div className="flex flex-col gap-2 px-2.5 pb-1 min-h-[48px]">
        {tasks.map((task) => (
          <SortableTaskCard key={task.id} task={task} onSelect={onSelectTask} />
        ))}
      </div>

      {/* ── Add task area ── */}
      <div className="px-2.5 pb-2.5 pt-1">
        {isAddingTask ? (
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-[#0f1d31]">
            <input
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
                if (e.key === "Escape") {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }
              }}
              placeholder="Task title…"
              className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <div className="flex gap-1.5">
              <button
                onClick={handleAddTask}
                className="rounded-lg bg-[#0f2d5a] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#0c2447] transition-colors"
              >
                Add task
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }}
                className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-400 transition-all hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-300"
          >
            <Plus size={14} />
            Add task
          </button>
        )}
      </div>
    </div>
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
  );
}
