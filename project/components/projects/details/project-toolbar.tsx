"use client";

import React, { useState } from "react";
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

/** Right-side controls shared by every tab toolbar */
function ToolbarControls({
  searchQuery,
  setSearchQuery,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  selectedStatusFilter,
  setSelectedStatusFilter,
  sortBy,
  setSortBy,
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const hasActiveFilters =
    selectedPriorityFilter !== "All" || selectedStatusFilter !== "All";

  return (
    <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
      {/* Search toggle */}
      <div className="relative flex items-center">
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-blue-500 rounded-lg px-2 py-1">
            <Search size={13} className="text-blue-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-36 text-xs bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 p-0"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-1.5 rounded-lg border transition-colors ${
              searchQuery
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Search tasks"
          >
            <Search size={14} />
          </button>
        )}
      </div>

      {/* Filter dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
            hasActiveFilters
              ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40"
              : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Filter size={13} /> Filter
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          )}
        </button>

        {isFilterOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={selectedPriorityFilter}
                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="On track">On track</option>
                <option value="At risk">At risk</option>
                <option value="Off track">Off track</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSelectedPriorityFilter("All");
                  setSelectedStatusFilter("All");
                  setIsFilterOpen(false);
                }}
                className="w-full text-center text-xs text-blue-600 hover:underline pt-1"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sort dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsSortOpen((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
            sortBy !== "default"
              ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40"
              : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Filter size={13} className="hidden" />
          <span className="flex items-center gap-1">↕ Sort</span>
        </button>

        {isSortOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 space-y-1">
            {(
              [
                { value: "default", label: "Default" },
                { value: "name", label: "Alphabetical (A–Z)" },
                { value: "priority", label: "Priority" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setSortBy(value);
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  sortBy === value
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
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

  // Calendar mode: render only the filter/sort/search controls, no wrapper bar
  if (calendarMode) {
    return sharedControls;
  }

  return (
    <div className="px-6 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 flex-wrap gap-2">
      {/* Add Task split button */}
      <div className="relative inline-flex rounded-md shadow-xs">
        <button
          onClick={() => onAddTask("to-do")}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg text-xs font-semibold transition-colors"
        >
          <Plus size={14} /> Add task
        </button>
        <button
          onClick={() => setIsAddTaskDropdownOpen((v) => !v)}
          className="px-1.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-r-lg text-xs transition-colors border-l border-blue-500"
        >
          <ChevronDown size={14} />
        </button>

        {isAddTaskDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs">
            <button
              onClick={() => {
                onAddTask("to-do");
                setIsAddTaskDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
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
                onAddTask("to-do");
                setIsAddTaskDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <CheckCircle2 size={14} className="text-emerald-500" /> Approval
            </button>

            <button
              onClick={() => {
                onAddTask("to-do");
                setIsAddTaskDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <Star size={14} className="text-amber-500" /> Milestone
            </button>

            {onAddSection && (
              <button
                onClick={() => {
                  setIsAddTaskDropdownOpen(false);
                  onAddSection();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 font-semibold"
              >
                <Layers size={14} className="text-purple-500" /> Section
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right-side search / filter / sort */}
      {sharedControls}
    </div>
  );
}
