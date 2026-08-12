"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { SortableTaskCard } from "./task-card";
import { useBoardStore } from "@/stores/board-store";
import type { ListWithTasks } from "@/actions/list-actions";
import type { TaskRecord } from "@/actions/task-actions";

interface KanbanColumnProps {
  list: ListWithTasks;
  tasks: TaskRecord[];
  onSelectTask?: (task: TaskRecord) => void;
}

/* Stable accent colour per list — persists across re-renders via module-level map */
const ACCENTS = ["#00b4d8", "#1985a1", "#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#0f2d5a"];
let _idx = 0;
const _colorMap = new Map<string, string>();
function accentFor(id: string) {
  if (!_colorMap.has(id)) { _colorMap.set(id, ACCENTS[_idx++ % ACCENTS.length]); }
  return _colorMap.get(id)!;
}

export function KanbanColumn({ list, tasks, onSelectTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: list.id, data: { listId: list.id } });
  const { createTask, deleteList } = useBoardStore();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleAddTask() {
    if (!newTaskTitle.trim()) return;
    await createTask(list.id, { title: newTaskTitle.trim(), listId: list.id });
    setNewTaskTitle("");
    setIsAddingTask(false);
  }

  return (
    <div
      ref={setNodeRef}
      className="flex w-[272px] flex-shrink-0 flex-col rounded-xl bg-[#f5f6f7] dark:bg-[#14263e]/70 border border-slate-200/80 dark:border-slate-700/50"
    >
      {/* ── Column header ── */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{list.name}</h3>
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">{tasks.length}</span>
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
                onClick={async () => { setMenuOpen(false); await deleteList(list.id); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 size={12} /> Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Task cards ── */}
      <div className="flex flex-col gap-2 px-2.5 pb-1 min-h-[48px]">
        {tasks.map((task) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            onSelect={onSelectTask}
          />
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
                if (e.key === "Escape") { setIsAddingTask(false); setNewTaskTitle(""); }
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
                onClick={() => { setIsAddingTask(false); setNewTaskTitle(""); }}
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
  );
}
