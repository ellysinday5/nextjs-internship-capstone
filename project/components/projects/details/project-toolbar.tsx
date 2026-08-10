"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Layers,
  Search,
  CheckCircle2,
  Star,
  X,
} from "lucide-react";

interface ProjectToolbarProps {
  onAddTask: (sectionId?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (p: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (s: string) => void;
  sortBy: "default" | "name" | "priority";
  setSortBy: (sort: "default" | "name" | "priority") => void;
  onAddSection?: () => void;
  /**
   * When true, only the right-side search / filter / sort controls are
   * rendered (no wrapper bar, no Add-task split button). Used when the
   * calendar tab provides its own wrapper row.
   */
  calendarMode?: boolean;
}

/** Bordered filter dropdown — matches the /projects page style */
function FilterPill({
  label,
  value,
  options,
  onSelect,
  icon,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isActive = value !== "All";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all ${
          isActive
            ? "border-[#0033a0] bg-[#0033a0]/5 text-[#0033a0] dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400"
            : "border-[#142843]/60 bg-white text-[#142843] hover:border-[#142843] hover:bg-slate-50 dark:border-slate-600 dark:bg-[#14263e] dark:text-slate-200 dark:hover:border-slate-500"
        }`}
      >
        {icon}
        <span>{isActive ? value : label}</span>
        <ChevronDown size={12} className="opacity-60" />
        {isActive && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#0033a0] dark:bg-blue-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-44 bg-white dark:bg-[#14263e] border-2 border-[#142843]/30 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-0.5">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                value === opt
                  ? "bg-[#0033a0]/10 text-[#0033a0] dark:bg-blue-950/50 dark:text-blue-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              {opt === "All" ? `All ${label}s` : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Right-side controls shared by every tab toolbar */
function ToolbarControls({
  searchQuery,
  setSearchQuery,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  selectedStatusFilter,
  setSelectedStatusFilter,
}: Pick<
  ProjectToolbarProps,
  | "searchQuery"
  | "setSearchQuery"
  | "selectedPriorityFilter"
  | "setSelectedPriorityFilter"
  | "selectedStatusFilter"
  | "setSelectedStatusFilter"
  | "sortBy"
  | "setSortBy"
>) {
  const hasActiveFilters =
    selectedPriorityFilter !== "All" || selectedStatusFilter !== "All";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search — bordered box style matching /projects page */}
      <div className="relative w-52">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-4 pr-9 py-2 bg-white dark:bg-[#14263e] border-2 border-[#142843]/70 dark:border-slate-600 rounded-xl text-xs font-medium text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033a0] focus:border-[#0033a0] dark:focus:border-blue-500 transition-all"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        ) : (
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#142843] dark:text-slate-400 pointer-events-none"
            size={13}
          />
        )}
      </div>

      {/* Status filter */}
      <FilterPill
        label="Status"
        value={selectedStatusFilter}
        options={["All", "On track", "At risk", "Off track"]}
        onSelect={setSelectedStatusFilter}
        icon={<Filter size={12} className="opacity-70" />}
      />

      {/* Priority filter */}
      <FilterPill
        label="Priority"
        value={selectedPriorityFilter}
        options={["All", "Low", "Medium", "High"]}
        onSelect={setSelectedPriorityFilter}
        icon={<ArrowUpDown size={12} className="opacity-70" />}
      />

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setSelectedPriorityFilter("All");
            setSelectedStatusFilter("All");
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer px-2.5 py-1.5 rounded-lg"
        >
          <X size={12} className="mr-0.5" />
          Clear Filters
        </button>
      )}
    </div>
  );
}

export function ProjectToolbar({
  onAddTask,
  searchQuery,
  setSearchQuery,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  selectedStatusFilter,
  setSelectedStatusFilter,
  sortBy,
  setSortBy,
  onAddSection,
  calendarMode = false,
}: ProjectToolbarProps) {
  const [isAddTaskDropdownOpen, setIsAddTaskDropdownOpen] = useState(false);

  const sharedControls = (
    <ToolbarControls
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedPriorityFilter={selectedPriorityFilter}
      setSelectedPriorityFilter={setSelectedPriorityFilter}
      selectedStatusFilter={selectedStatusFilter}
      setSelectedStatusFilter={setSelectedStatusFilter}
      sortBy={sortBy}
      setSortBy={setSortBy}
    />
  );

  if (calendarMode) {
    return sharedControls;
  }

  return (
    <div className="px-6 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 flex-wrap gap-2">
      {/* Add Task split button */}
      <div className="relative inline-flex rounded-xl shadow-sm overflow-visible">
        <button
          onClick={() => onAddTask()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f2d5a] hover:bg-[#0c2447] text-white rounded-l-xl text-xs font-bold transition-colors"
        >
          <Plus size={14} /> Add task
        </button>
        <button
          onClick={() => setIsAddTaskDropdownOpen((v) => !v)}
          className="px-2 py-2 bg-[#0c2447] hover:bg-[#091e35] text-white rounded-r-xl text-xs transition-colors border-l border-white/20"
        >
          <ChevronDown size={13} />
        </button>

        {isAddTaskDropdownOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-[#14263e] border-2 border-[#142843]/30 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs overflow-hidden">
            <button
              onClick={() => {
                onAddTask();
                setIsAddTaskDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={14} className="text-blue-500" /> Task
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                Default
              </span>
            </button>

            <button
              onClick={() => {
                onAddTask();
                setIsAddTaskDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <CheckCircle2 size={14} className="text-emerald-500" /> Approval
            </button>

            <button
              onClick={() => {
                onAddTask();
                setIsAddTaskDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <Star size={14} className="text-amber-500" /> Milestone
            </button>

            {onAddSection && (
              <>
                <div className="border-t border-slate-100 dark:border-slate-800 mx-2 my-1" />
                <button
                  onClick={() => {
                    setIsAddTaskDropdownOpen(false);
                    onAddSection();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  <Layers size={14} className="text-purple-500" /> Section
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right-side search / filter / sort */}
      {sharedControls}
    </div>
  );
}
