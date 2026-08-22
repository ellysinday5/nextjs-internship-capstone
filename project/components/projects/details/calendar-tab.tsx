"use client";

import type { TaskItem } from "@/components/tasks/task-details";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import React, { useState } from "react";
import { ProjectToolbar } from "./project-toolbar";
import type { Section } from "./types";

interface CalendarTabProps {
  sections: Section[];
  onSelectTask: (task: TaskItem) => void;
  onAddTask: (sectionId?: string) => void;
}

function buildCalendarDays(year: number, month: number, allTasks: TaskItem[]) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells: {
    num: number;
    isCurrentMonth: boolean;
    isToday?: boolean;
    task?: TaskItem;
  }[] = [];

  // Pad with previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ num: daysInPrevMonth - i, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const matchingTask = allTasks.find((t) => {
      if (!t.dueDate) return false;
      const parts = t.dueDate.split("–");
      const endStr = (parts[1] || parts[0]).trim();
      const endNum = Number.parseInt(endStr);
      return endNum === d;
    });

    cells.push({
      num: d,
      isCurrentMonth: true,
      isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === d,
      task: matchingTask,
    });
  }

  // Fill remaining with next month days
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ num: nextDay++, isCurrentMonth: false });
  }

  return cells;
}

export function CalendarTab({ sections, onSelectTask, onAddTask }: CalendarTabProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Toolbar state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "name" | "priority">("default");

  const allTasks = sections
    .flatMap((s) => s.tasks)
    .filter((task) => {
      const matchesSearch =
        !searchQuery.trim() || task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        selectedPriorityFilter === "All" || task.priority === selectedPriorityFilter;
      const matchesStatus = selectedStatusFilter === "All" || task.status === selectedStatusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const calendarDays = buildCalendarDays(viewYear, viewMonth, allTasks);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0f1d31] overflow-hidden">
      {/* Shared Toolbar with month nav embedded */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 px-6 py-2.5 flex-wrap gap-2">
        {/* Left: Add Task + Month Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onAddTask("to-do")}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={14} /> Add task
          </button>

          <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <ChevronRight size={16} />
            </button>
            <span className="ml-2 font-bold text-slate-900 dark:text-white">{monthLabel}</span>
          </div>
        </div>

        {/* Right: Search / Filter / Sort from shared toolbar (reusing its right side) */}
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
          calendarMode
        />
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-[700px] h-full flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 py-2 px-3 text-left">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-200 dark:divide-slate-800">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className="group relative p-2.5 flex flex-col justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors min-h-[100px]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      day.isToday
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
                        : day.isCurrentMonth
                          ? "text-slate-700 dark:text-slate-200"
                          : "text-slate-300 dark:text-slate-700"
                    }`}
                  >
                    {day.num}
                  </span>
                </div>

                {day.task && (
                  <div
                    onClick={() => onSelectTask(day.task as TaskItem)}
                    className="mt-1 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 p-2 shadow-2xs hover:border-blue-400 text-xs font-semibold text-blue-800 dark:text-blue-200 cursor-pointer truncate"
                  >
                    {(day.task as TaskItem).title}
                  </div>
                )}

                <button
                  onClick={() => onAddTask("to-do")}
                  className="opacity-0 group-hover:opacity-100 text-[11px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1 pt-1 transition-opacity"
                >
                  <Plus size={12} /> Add task
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
