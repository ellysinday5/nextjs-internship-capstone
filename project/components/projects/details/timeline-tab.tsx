"use client";

import type { TaskItem } from "@/components/tasks/task-details";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  Link,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { ProjectToolbar } from "./project-toolbar";
import type { Section } from "./types";

interface TimelineTabProps {
  sections: Section[];
  onSelectTask: (task: TaskItem) => void;
  onAddTask: (sectionId?: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  task: TaskItem;
}

export function TimelineTab({ sections, onSelectTask, onAddTask, onDeleteTask }: TimelineTabProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Toolbar state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "name" | "priority">("default");

  // Close context menu on any outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleTaskContextMenu = (e: React.MouseEvent, task: TaskItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, task });
  };

  // Filter + sort tasks
  const allTasks = sections
    .flatMap((s) => s.tasks)
    .filter((task) => {
      const matchesSearch =
        !searchQuery.trim() || task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        selectedPriorityFilter === "All" || task.priority === selectedPriorityFilter;
      const matchesStatus = selectedStatusFilter === "All" || task.status === selectedStatusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "priority") {
        const rank: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
        return (rank[a.priority ?? "Low"] ?? 9) - (rank[b.priority ?? "Low"] ?? 9);
      }
      return 0;
    });

  const COLORS = [
    "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800",
    "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-800",
    "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800",
    "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800",
  ];

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-[#0f1d31]/50 overflow-hidden">
      {/* Shared Toolbar */}
      <ProjectToolbar
        onAddTask={onAddTask}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPriorityFilter={selectedPriorityFilter}
        setSelectedPriorityFilter={setSelectedPriorityFilter}
        selectedStatusFilter={selectedStatusFilter}
        setSelectedStatusFilter={setSelectedStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="min-w-[800px] border border-slate-200 bg-white rounded-2xl p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
          {/* Day column headers */}
          <div className="grid grid-cols-12 gap-2 text-center text-xs font-semibold text-slate-400 border-b border-slate-100 pb-3 dark:border-slate-800">
            {[
              "Jul 20",
              "Jul 21",
              "Jul 22",
              "Jul 23",
              "Jul 24",
              "Jul 25",
              "Jul 26",
              "Jul 27",
              "Jul 28",
              "Jul 29",
              "Jul 30",
              "Jul 31",
            ].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Task Bars */}
          <div className="space-y-4 pt-2">
            {allTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                <p className="text-sm font-medium">No tasks match your filters</p>
                <button
                  onClick={() => onAddTask("to-do")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  <Plus size={13} /> Add task
                </button>
              </div>
            ) : (
              allTasks.map((task, idx) => (
                <div key={task.id} className="relative h-10 flex items-center">
                  <div
                    onContextMenu={(e) => handleTaskContextMenu(e, task)}
                    onClick={() => onSelectTask(task)}
                    className={`absolute rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer shadow-xs transition-all hover:ring-2 hover:ring-blue-500/50 flex items-center justify-between ${COLORS[idx % COLORS.length]}`}
                    style={{
                      left: `${(idx * 15) % 65}%`,
                      width: `${Math.max(22, 35 - idx * 3)}%`,
                    }}
                  >
                    <span className="truncate">{task.title}</span>
                    {task.status && (
                      <span className="ml-2 text-[10px] font-bold opacity-80 shrink-0">
                        {task.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-800 dark:bg-[#14263e] text-xs space-y-0.5"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setContextMenu(null)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Copy size={15} className="text-slate-500" />
            <span>Duplicate task</span>
          </button>

          <button
            onClick={() => {
              onAddTask("to-do");
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <PlusCircle size={15} className="text-slate-500" />
            <span>Create follow-up task</span>
          </button>

          <button
            onClick={() => setContextMenu(null)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <CheckCircle2 size={15} className="text-slate-500" />
            <span>Mark complete</span>
          </button>

          <button
            onClick={() => setContextMenu(null)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 pb-2 mb-1"
          >
            <span className="flex items-center gap-2.5">
              <ChevronRight size={15} className="text-slate-500" />
              Convert to
            </span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          <button
            onClick={() => {
              onSelectTask(contextMenu.task);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Eye size={15} className="text-slate-500" />
            <span>Open task details</span>
          </button>

          <button
            onClick={() => setContextMenu(null)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink size={15} className="text-slate-500" />
            <span>Open in new tab</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 pb-2 mb-1"
          >
            <Link size={15} className="text-slate-500" />
            <span>Copy task link</span>
          </button>

          <button
            onClick={() => {
              if (onDeleteTask) onDeleteTask(contextMenu.task.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium"
          >
            <Trash2 size={15} className="text-red-500" />
            <span>Delete task</span>
          </button>
        </div>
      )}
    </div>
  );
}
