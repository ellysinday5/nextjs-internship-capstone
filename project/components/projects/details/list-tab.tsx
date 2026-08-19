"use client";

import type { TaskItem } from "@/components/tasks/task-details";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

export interface Section {
  id: string;
  title: string;
  tasks: TaskItem[];
}

interface ListTabProps {
  filteredSections: Section[];
  selectedTask: TaskItem | null;
  onSelectTask: (task: TaskItem) => void;
  inlineAddingSectionId: string | null;
  setInlineAddingSectionId: (id: string | null) => void;
  newTaskTitle: string;
  setNewTaskTitle: (v: string) => void;
  onSaveInlineTask: (listId: string) => void;
}

export function ListTab({
  filteredSections,
  selectedTask,
  onSelectTask,
  inlineAddingSectionId,
  setInlineAddingSectionId,
  newTaskTitle,
  setNewTaskTitle,
  onSaveInlineTask,
}: ListTabProps) {
  const inlineInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inlineAddingSectionId && inlineInputRef.current) {
      inlineInputRef.current.focus();
    }
  }, [inlineAddingSectionId]);

  return (
    <div className="flex-1 overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_180px_140px_120px_120px_40px] border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 px-6 py-1.5 bg-slate-50/30 dark:bg-[#0f1d31]/30">
        <div>Name</div>
        <div>Assignee</div>
        <div>Due date</div>
        <div>Priority</div>
        <div>Status</div>
        <div className="text-center">+</div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filteredSections.map((section) => (
          <div key={section.id} className="py-2">
            <div className="flex items-center gap-2 px-6 py-2">
              <ChevronDown size={14} className="text-slate-400" />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {section.title}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {section.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`grid grid-cols-[1fr_180px_140px_120px_120px_40px] items-center px-6 py-1.5 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 cursor-pointer text-xs transition-colors ${
                    selectedTask?.id === task.id ? "bg-sky-50 dark:bg-sky-950/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <CheckCircle2
                      size={16}
                      className="text-slate-300 dark:text-slate-600 hover:text-emerald-500 shrink-0"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </span>
                  </div>
                  <div>
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {task.assignee.initials}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 truncate text-[11px]">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">
                        +
                      </span>
                    )}
                  </div>
                  <div>
                    {task.dueDate && (
                      <span className="text-rose-500 font-medium text-[11px]">{task.dueDate}</span>
                    )}
                  </div>
                  <div>
                    {task.priority && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        {task.priority}
                      </span>
                    )}
                  </div>
                  <div>
                    {task.status && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                        {task.status}
                      </span>
                    )}
                  </div>
                  <div />
                </div>
              ))}

              {inlineAddingSectionId === section.id ? (
                <div className="grid grid-cols-[1fr_180px_140px_120px_120px_40px] items-center px-6 py-1.5 bg-sky-50/30 border-l-2 border-sky-500">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-slate-300" />
                    <input
                      ref={inlineInputRef}
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSaveInlineTask(section.id);
                        if (e.key === "Escape") setInlineAddingSectionId(null);
                      }}
                      onBlur={() => onSaveInlineTask(section.id)}
                      placeholder="Write a task name"
                      className="w-full text-xs bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 p-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="px-6 py-2">
                  <button
                    onClick={() => setInlineAddingSectionId(section.id)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                  >
                    Add task...
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
