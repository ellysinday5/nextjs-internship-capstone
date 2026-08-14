"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle2,
  MessageSquare,
  Calendar,
  GripVertical,
  User,
  Pencil,
  MoreHorizontal,
  Trash2,
  Flag,
} from "lucide-react";
import type { TaskRecord } from "@/actions/task-actions";

type CardPriority = "low" | "medium" | "high";

export interface TaskCardProps {
  task: TaskRecord;
  isDragging?: boolean;
  onSelect?: (task: TaskRecord) => void;
  onDelete?: (id: string) => void;
  onMarkComplete?: (id: string) => void;
  onAddSubtask?: (task: TaskRecord) => void;
}

const PRIORITY_BADGE: Record<CardPriority, string> = {
  high: "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900",
  medium: "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
  low: "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
};

const PRIORITY_FLAG: Record<CardPriority, string> = {
  high: "text-rose-500",
  medium: "text-amber-400",
  low: "text-emerald-500",
};

function normalizePriority(p: string | null): CardPriority | null {
  const l = p?.toLowerCase();
  if (l === "high" || l === "medium" || l === "low") return l;
  return null;
}

function isOverdue(d: Date | null) {
  return d ? new Date(d) < new Date() : false;
}

/* ─── Plain display card ──────────────────────────────────────────────────── */
export function TaskCard({ task, isDragging, onSelect, onDelete, onMarkComplete, onAddSubtask }: TaskCardProps) {
  const priority = normalizePriority(task.priority);
  const overdue = isOverdue(task.dueDate);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div
      className={`group relative cursor-pointer rounded-xl border bg-white p-3.5 transition-all
        dark:bg-[#0f1d31]
        ${isDragging
          ? "rotate-1 scale-[1.02] opacity-80 shadow-2xl border-[#00b4d8]/60 dark:border-[#00b4d8]/40"
          : "border-slate-200 shadow-sm hover:shadow-md hover:border-[#00b4d8]/40 dark:border-slate-700/60 dark:hover:border-[#00b4d8]/40"
        }`}
      onClick={() => onSelect?.(task)}
    >
      {/* ── Hover action toolbar ─────────────────────────────────────────── */}
      <div
        className="absolute -top-3 right-2 z-20 hidden group-hover:flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-[#1a2f4a] px-1 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mark complete */}
        <button
          type="button"
          title="Mark complete"
          onClick={() => onMarkComplete?.(task.id)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 transition-colors"
        >
          <CheckCircle2 size={14} />
        </button>

        {/* Edit (open detail pane) */}
        <button
          type="button"
          title="Edit task"
          onClick={() => onSelect?.(task)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
        >
          <Pencil size={13} />
        </button>

        {/* More menu */}
        <div className="relative">
          <button
            type="button"
            title="More options"
            onClick={() => setMoreOpen((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-[#1a2f4a] z-30">
              <button
                type="button"
                onClick={() => { setMoreOpen(false); onDelete?.(task.id); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 size={12} /> Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Card body ──────────────────────────────────────────────────────── */}

      {/* Title row */}
      <div className="mb-2 flex items-start gap-2">
        <CheckCircle2
          size={15}
          className="mt-0.5 shrink-0 text-slate-300 transition-colors group-hover:text-[#00b4d8]/50 dark:text-slate-600"
        />
        <p className="flex-1 text-[13px] font-semibold leading-snug text-slate-800 dark:text-slate-100">
          {task.title}
        </p>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mb-2 ml-[23px] line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}

      {/* Priority badge */}
      {priority && (
        <div className="mb-2 ml-[23px]">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_BADGE[priority]}`}>
            <Flag size={9} className={PRIORITY_FLAG[priority]} />
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="ml-[23px] flex items-center justify-between mt-1">
        {task.assignee ? (
          <span
            title={task.assignee.name}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-extrabold text-amber-950 shadow-sm ring-2 ring-white dark:ring-[#0f1d31]"
          >
            {task.assignee.name.slice(0, 2).toUpperCase()}
          </span>
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 dark:border-slate-600">
            <User size={11} />
          </span>
        )}

        <div className="flex items-center gap-2 text-[11px]">
          {task.dueDate && (
            <span className={`flex items-center gap-1 font-semibold ${overdue ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}>
              <Calendar size={11} />
              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(task.dueDate))}
            </span>
          )}
          {task.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <MessageSquare size={11} />
              {task.commentsCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sortable wrapper ───────────────────────────────────────────────────── */
export function SortableTaskCard(props: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.task.id,
    data: { type: "task", listId: props.task.listId },
  });

  return (
    <div
      ref={setNodeRef}
      data-task-id={props.task.id}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="relative group"
    >
      <TaskCard {...props} isDragging={isDragging} />
    </div>
  );
}
