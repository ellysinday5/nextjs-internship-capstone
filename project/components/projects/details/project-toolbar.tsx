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
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const hasActiveFilters =
    selectedPriorityFilter !== "All" || selectedStatusFilter !== "All";

  // Pill base classes
  const pill =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors text-xs font-semibold cursor-pointer";
  const pillIdle =
    "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300";
  const pillActive =
    "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:border-blue-500";

  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
      {/* Search toggle */}
      <div className="relative flex items-center">
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-blue-500 rounded-full px-3 py-1.5">
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
            className={`${pill} ${searchQuery ? pillActive : pillIdle}`}
            title="Search tasks"
          >
            <Search size={13} />
            <span>Search</span>
          </button>
        )}
      </div>

      {/* Status filter pill */}
      <div className="relative">
        <button
          onClick={() => {
            setIsStatusOpen((v) => !v);
            setIsPriorityOpen(false);
          }}
          className={`${pill} ${selectedStatusFilter !== "All" ? pillActive : pillIdle}`}
        >
          <span>Status</span>
          <Filter size={12} className="opacity-70" />
          {selectedStatusFilter !== "All" && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
          )}
        </button>

        {isStatusOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-44 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 space-y-1">
            {["All", "On track", "At risk", "Off track"].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelectedStatusFilter(opt);
                  setIsStatusOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedStatusFilter === opt
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                {opt === "All" ? "All Statuses" : opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Priority filter pill */}
      <div className="relative">
        <button
          onClick={() => {
            setIsPriorityOpen((v) => !v);
            setIsStatusOpen(false);
          }}
          className={`${pill} ${selectedPriorityFilter !== "All" ? pillActive : pillIdle}`}
        >
          <span>Priority</span>
          <ArrowUpDown size={12} className="opacity-70" />
          {selectedPriorityFilter !== "All" && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
          )}
        </button>

        {isPriorityOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-44 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 space-y-1">
            {["All", "Low", "Medium", "High"].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelectedPriorityFilter(opt);
                  setIsPriorityOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedPriorityFilter === opt
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                {opt === "All" ? "All Priorities" : opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear all active filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setSelectedPriorityFilter("All");
            setSelectedStatusFilter("All");
          }}
          className={`${pill} border-red-300 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20`}
        >
          <X size={12} />
          Clear
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
