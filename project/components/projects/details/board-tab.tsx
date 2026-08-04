"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { TaskItem } from "@/components/tasks/task-details";
import { ProjectToolbar } from "./project-toolbar";
import { Section } from "./types";

interface BoardTabProps {
  sections: Section[];
  onSelectTask: (task: TaskItem) => void;
  onAddTask: (sectionId: string) => void;
  onAddSection: () => void;
}

export function BoardTab({
  sections,
  onSelectTask,
  onAddTask,
  onAddSection,
}: BoardTabProps) {
  const [inlineAddingSectionId, setInlineAddingSectionId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const [localSections, setLocalSections] = useState<Section[]>(sections);

  // Search/filter/sort state for board toolbar
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "name" | "priority">("default");

  // Sync sections from parent
  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  useEffect(() => {
    if (inlineAddingSectionId && inlineInputRef.current) {
      inlineInputRef.current.focus();
    }
  }, [inlineAddingSectionId]);

  const triggerInlineAdd = (sectionId: string) => {
    setInlineAddingSectionId(sectionId);
    onAddTask(sectionId);
  };

  const handleSaveInlineTask = (sectionId: string) => {
    if (!newTaskTitle.trim()) {
      setInlineAddingSectionId(null);
      return;
    }
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskTitle,
      sectionId: localSections.find((s) => s.id === sectionId)?.title || "To do",
      status: "On track",
      priority: "Medium",
    };
    setLocalSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId ? { ...sec, tasks: [...sec.tasks, newTask] } : sec
      )
    );
    setNewTaskTitle("");
    setInlineAddingSectionId(null);
  };

  // Apply filters/search/sort locally
  const visibleSections = localSections.map((sec) => {
    let filtered = sec.tasks.filter((task) => {
      const matchesSearch = !searchQuery.trim() || task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = selectedPriorityFilter === "All" || task.priority === selectedPriorityFilter;
      const matchesStatus = selectedStatusFilter === "All" || task.status === selectedStatusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
    if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "priority") {
      const pRank: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
      filtered = [...filtered].sort((a, b) => (pRank[a.priority ?? "Low"] || 9) - (pRank[b.priority ?? "Low"] || 9));
    }
    return { ...sec, tasks: filtered };
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#0f1d31]/50">
      {/* Shared Toolbar */}
      <ProjectToolbar
        onAddTask={(sectionId) => triggerInlineAdd(sectionId || "to-do")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPriorityFilter={selectedPriorityFilter}
        setSelectedPriorityFilter={setSelectedPriorityFilter}
        selectedStatusFilter={selectedStatusFilter}
        setSelectedStatusFilter={setSelectedStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddSection={onAddSection}
      />

      {/* Kanban Board Columns */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex items-start gap-4 h-full">
          {visibleSections.map((section) => (
            <div
              key={section.id}
              className="w-72 shrink-0 flex flex-col rounded-2xl bg-slate-100/80 p-3 dark:bg-slate-900/60 max-h-full border border-slate-200/60 dark:border-slate-800"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1 mb-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <span>{section.title}</span>
                  <span className="text-slate-400 font-normal">{section.tasks.length}</span>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {section.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-blue-400 hover:shadow-md cursor-pointer transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 space-y-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-slate-400 group-hover:text-emerald-500 shrink-0 mt-0.5" />
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {task.priority && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            task.priority === "Low"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : task.priority === "Medium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}
                      {task.status && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            task.status === "On track"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                              : task.status === "At risk"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {task.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {task.assignee ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-amber-950">
                          {task.assignee.initials}
                        </span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border border-dashed border-slate-300" />
                      )}
                      {task.dueDate && (
                        <span className="text-[10px] font-medium text-rose-500">{task.dueDate}</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Inline add task input */}
                {inlineAddingSectionId === section.id && (
                  <div className="rounded-xl border border-blue-400 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-2">
                    <input
                      ref={inlineInputRef}
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveInlineTask(section.id);
                        if (e.key === "Escape") setInlineAddingSectionId(null);
                      }}
                      onBlur={() => handleSaveInlineTask(section.id)}
                      placeholder="Write a task name"
                      className="w-full text-xs bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 p-0"
                    />
                    <div className="flex gap-2">
                      <button
                        onMouseDown={() => handleSaveInlineTask(section.id)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-semibold"
                      >
                        Add
                      </button>
                      <button
                        onMouseDown={() => setInlineAddingSectionId(null)}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-[10px] font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add task button at column bottom */}
              <button
                onClick={() => triggerInlineAdd(section.id)}
                className="mt-3 flex items-center gap-1.5 w-full rounded-xl py-2 px-3 text-xs font-semibold text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus size={14} /> Add task
              </button>
            </div>
          ))}

          {/* Add section button */}
          <button
            onClick={onAddSection}
            className="w-64 shrink-0 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={15} /> Add section
          </button>
        </div>
      </div>
    </div>
  );
}
