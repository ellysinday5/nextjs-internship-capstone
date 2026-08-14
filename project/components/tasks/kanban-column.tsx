"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Trash2, Pencil, GripVertical } from "lucide-react";
import { SortableTaskCard } from "./task-card";
import { useBoardStore } from "@/stores/board-store";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import type { ListWithTasks } from "@/actions/list-actions";
import type { TaskRecord } from "@/actions/task-actions";

interface KanbanColumnProps {
  list: ListWithTasks;
  tasks: TaskRecord[];
  onSelectTask?: (task: TaskRecord) => void;
}

export function KanbanColumn({ list, tasks, onSelectTask }: KanbanColumnProps) {
  const { deleteList, renameList } = useBoardStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(list.name);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
            <SortableTaskCard
              key={task.id}
              task={task}
              onSelect={onSelectTask}
            />
          ))}
        </div>
      </div>

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
  );
}
