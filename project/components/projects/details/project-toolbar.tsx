"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  X,
  Users2,
  MessageSquare,
  HelpCircle,
  Trash2,
  Save,
  RotateCcw,
} from "lucide-react";

interface ProjectToolbarProps {
  onAddTask: (sectionId?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (p: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (s: string) => void;
  sortBy: "default" | "name" | "priority" | "assignee" | "dueDate" | "startDate" | "dateCreated" | "dateUpdated" | "dateClosed" | "timeTracked" | "timeEstimate" | "totalTimeInStatus" | "duration";
  setSortBy: (sort: any) => void;
  onAddSection?: () => void;
  calendarMode?: boolean;
  /** When true, the Closed button toggles completed-task visibility and shows the Save view button */
  tableMode?: boolean;
  showClosedTasks?: boolean;
  onToggleClosedTasks?: () => void;
  /** Called when the user clicks "Revert changes" — resets to last saved state */
  onRevertClosedTasks?: () => void;
  /** Hide the Closed button entirely (use on Board and List tabs) */
  hideClosed?: boolean;
  /** Save view callbacks — wired to localStorage persistence in table mode */
  onSaveView?: () => void;
  onEnableAutosave?: () => void;
  autosaveEnabled?: boolean;
  onSaveAsNewView?: () => void;
}

interface FilterRule {
  id: string;
  field: "Status" | "Tags" | "Due date" | "Priority" | "Assignee" | "Archived" | "Assigned comment" | "Created by" | "Date closed" | "Date created";
  operator: "Is";
  value: string;
}

const AVAILABLE_ASSIGNEES = [
  "Ellen Grace Sinday",
  "John Doe",
  "Jane Smith",
  "Bob Johnson",
];

const FILTER_FIELDS = [
  "Status",
  "Tags",
  "Due date",
  "Priority",
  "Assignee",
  "Archived",
  "Assigned comment",
  "Created by",
  "Date closed",
  "Date created",
];

const SORT_OPTIONS = [
  { value: "default", label: "Status" },
  { value: "name", label: "Task Name" },
  { value: "assignee", label: "Assignee" },
  { value: "priority", label: "Priority" },
  { value: "dueDate", label: "Due date" },
  { value: "startDate", label: "Start date" },
  { value: "dateCreated", label: "Date created" },
  { value: "dateUpdated", label: "Date updated" },
  { value: "dateClosed", label: "Date closed" },
  { value: "timeTracked", label: "Time tracked" },
  { value: "timeEstimate", label: "Time estimate" },
  { value: "totalTimeInStatus", label: "Total time in Status" },
  { value: "duration", label: "Duration" },
];

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
  tableMode = false,
  showClosedTasks = false,
  onToggleClosedTasks,
  onRevertClosedTasks,
  hideClosed = false,
  onSaveView,
  onEnableAutosave,
  autosaveEnabled = false,
  onSaveAsNewView,
}: ProjectToolbarProps) {
  const [isAddTaskDropdownOpen, setIsAddTaskDropdownOpen] = useState(false);

  // ClickUp-style advanced filters state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filtersList, setFiltersList] = useState<FilterRule[]>([]);
  const [showSavedFiltersMenu, setShowSavedFiltersMenu] = useState(false);
  const [filterFieldSearch, setFilterFieldSearch] = useState("");
  const [activeDropdownRuleId, setActiveDropdownRuleId] = useState<string | null>(null);

  // Closed & Save View Options
  const [showClosedDropdown, setShowClosedDropdown] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Table-mode: Save view dropdown
  const [showSaveViewDropdown, setShowSaveViewDropdown] = useState(false);
  const saveViewDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (saveViewDropdownRef.current && !saveViewDropdownRef.current.contains(e.target as Node)) {
        setShowSaveViewDropdown(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);



  // Assignee search modal state
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("All");
  const [enableAssigneeComments, setEnableAssigneeComments] = useState(false);

  // Sort dropdown options state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortSearch, setSortSearch] = useState("");

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Sync filter changes back to parent
  useEffect(() => {
    const priorityRule = filtersList.find((r) => r.field === "Priority");
    if (priorityRule) {
      setSelectedPriorityFilter(priorityRule.value);
    } else {
      setSelectedPriorityFilter("All");
    }

    const statusRule = filtersList.find((r) => r.field === "Status");
    if (statusRule) {
      setSelectedStatusFilter(statusRule.value);
    } else {
      setSelectedStatusFilter("All");
    }
  }, [filtersList, setSelectedPriorityFilter, setSelectedStatusFilter]);

  const addFilterRule = () => {
    const newRule: FilterRule = {
      id: Math.random().toString(),
      field: "Status",
      operator: "Is",
      value: "On track",
    };
    setFiltersList([...filtersList, newRule]);
  };

  const updateFilterRule = (id: string, updates: Partial<FilterRule>) => {
    setFiltersList(filtersList.map((r) => r.id === id ? { ...r, ...updates } : r));
  };

  const removeFilterRule = (id: string) => {
    setFiltersList(filtersList.filter((r) => r.id !== id));
  };

  const filteredAssignees = AVAILABLE_ASSIGNEES.filter((name) =>
    name.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  const filteredSortOptions = SORT_OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(sortSearch.toLowerCase())
  );

  return (
    <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 flex flex-col gap-3 relative z-20">
      {/* ── Toolbar Actions Row ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Left side Add Task button */}
        {!calendarMode && (
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
                  <span className="flex items-center gap-2 font-semibold font-sans">
                    <CheckCircle2 size={14} className="text-blue-500" /> Task
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    Default
                  </span>
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
                      <Plus size={14} className="text-purple-500" /> Section
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right side options */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Search box */}
          <div className="relative w-52">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-4 pr-9 py-2 bg-white dark:bg-[#14263e] border-2 border-[#142843]/70 dark:border-slate-600 rounded-xl text-xs font-medium text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a] transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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

          {/* ClickUp-style Filter Toggle Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-xs font-bold transition-all ${
              filtersList.length > 0 || showFilterPanel
                ? "border-[#0f2d5a] bg-blue-50/20 text-[#0f2d5a] dark:border-blue-500 dark:text-blue-400"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Filter size={12} className="opacity-70" />
            <span>Filter</span>
            {filtersList.length > 0 && (
              <span className="ml-1 bg-[#0f2d5a] text-white px-1.5 py-0.5 rounded-full text-[10px]">
                {filtersList.length}
              </span>
            )}
          </button>

          {/* Assignee Search modal trigger */}
          <button
            onClick={() => setShowAssigneeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Users2 size={12} className="opacity-70" />
            <span>Assignee: {selectedAssignee}</span>
          </button>



          {/* Closed button — behaviour differs by tab mode */}
          {!hideClosed && (tableMode ? (
            /* ── Table tab: toggle completed tasks + Save view when active ── */
            <div className="flex items-center gap-0">
              {/* Save view split-button — only visible when closed tasks are shown */}
              {showClosedTasks && (
                <div className="relative mr-1.5" ref={saveViewDropdownRef}>
                  {/* Split button row */}
                  <div className="flex items-center">
                    <button
                      onClick={() => setShowSaveViewDropdown((v) => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-l-xl text-xs font-bold border-2 border-amber-500 transition-colors"
                    >
                      <CheckCircle2 size={12} />
                      <span>Save view</span>
                    </button>
                    <button
                      onClick={() => setShowSaveViewDropdown((v) => !v)}
                      className="px-2 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-r-xl text-xs font-bold border-2 border-amber-500 border-l-amber-400/50 transition-colors"
                    >
                      <ChevronDown size={11} />
                    </button>
                  </div>
                  {/* Dropdown — sibling to the split buttons, not nested inside them */}
                  {showSaveViewDropdown && (
                    <div
                      className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 text-xs overflow-hidden"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { setShowSaveViewDropdown(false); onSaveView?.(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold"
                      >
                        <CheckCircle2 size={13} className="text-slate-400" /> Save view
                      </button>
                      <button
                        onClick={() => { setShowSaveViewDropdown(false); onEnableAutosave?.(); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold ${autosaveEnabled ? "text-[#0052cc] dark:text-sky-400" : "text-slate-700 dark:text-slate-200"}`}
                      >
                        <Save size={13} className={autosaveEnabled ? "text-[#0052cc]" : "text-slate-400"} />
                        {autosaveEnabled ? "Autosave: On" : "Enable Autosave"}
                      </button>
                      <button
                        onClick={() => { setShowSaveViewDropdown(false); onSaveAsNewView?.(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold"
                      >
                        <Plus size={13} className="text-slate-400" /> Save as new view
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                      <button
                        onClick={() => {
                          setShowSaveViewDropdown(false);
                          onRevertClosedTasks?.();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-rose-500 font-semibold"
                      >
                        <RotateCcw size={13} /> Revert changes
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Closed toggle */}
              <button
                onClick={onToggleClosedTasks}
                title="Quickly show closed tasks"
                className={`inline-flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-xs font-bold transition-colors ${
                  showClosedTasks
                    ? "border-violet-500 bg-violet-500 text-white"
                    : "border-violet-500/60 bg-white dark:bg-[#1c304a] text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20"
                }`}
              >
                <CheckCircle2 size={12} className={showClosedTasks ? "text-white" : "text-violet-500"} />
                <span>Closed</span>
              </button>
            </div>
          ) : (
            /* ── Board / List tabs: Tasks & Subtasks dropdown ── */
            <div className="relative">
              <button
                onClick={() => setShowClosedDropdown(!showClosedDropdown)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-xs font-bold transition-colors ${
                  showClosedDropdown
                    ? "border-violet-500 bg-violet-500 text-white"
                    : "border-violet-500/60 bg-white dark:bg-[#1c304a] text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20"
                }`}
              >
                <CheckCircle2 size={12} className={showClosedDropdown ? "text-white" : "text-violet-500"} />
                <span>Closed</span>
              </button>

              {showClosedDropdown && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-2 text-xs overflow-hidden">
                  {/* Tasks toggle */}
                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Tasks</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showTasks}
                      onClick={() => setShowTasks((v) => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                        showTasks ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                          showTasks ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  {/* Subtasks toggle */}
                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Subtasks</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showSubtasks}
                      onClick={() => setShowSubtasks((v) => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                        showSubtasks ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                          showSubtasks ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ClickUp-style Sort Search Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <SlidersHorizontal size={12} className="opacity-70" />
              <span>Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Status"}</span>
              <ChevronDown size={11} />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 flex flex-col max-h-[300px] overflow-hidden text-xs">
                {/* Search field */}
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <input
                    type="text"
                    value={sortSearch}
                    onChange={(e) => setSortSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#0f1d31] text-[11px] font-semibold text-[#142843] dark:text-white focus:outline-none"
                  />
                </div>
                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                  {filteredSortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); setSortSearch(""); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                        sortBy === opt.value
                          ? "bg-blue-50 text-[#0f2d5a] dark:bg-blue-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ClickUp-style Advanced Filter Builder Panel ── */}
      {showFilterPanel && (
        <div className="p-4 bg-slate-50 dark:bg-[#0f1d31] border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#142843] dark:text-white">Filters</span>
              <HelpCircle size={12} className="text-slate-400 cursor-pointer" />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSavedFiltersMenu(!showSavedFiltersMenu)}
                className="text-xs font-bold text-slate-500 hover:text-[#142843] dark:hover:text-white inline-flex items-center gap-1"
              >
                Saved filters
                <ChevronDown size={10} />
              </button>
              {showSavedFiltersMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-20 text-xs">
                  <button
                    onClick={() => {
                      setFiltersList([
                        { id: "s1", field: "Status", operator: "Is", value: "On track" },
                        { id: "p1", field: "Priority", operator: "Is", value: "High" }
                      ]);
                      setShowSavedFiltersMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[#142843] dark:text-white font-medium"
                  >
                    High Priority Tasks
                  </button>
                  <button
                    onClick={() => {
                      setFiltersList([]);
                      setShowSavedFiltersMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-400 font-medium"
                  >
                    Clear Current
                  </button>
                </div>
              )}
            </div>
          </div>

          {filtersList.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-500 font-semibold mb-2">No active filter rules</p>
              <button
                onClick={addFilterRule}
                className="text-xs font-bold text-[#0f2d5a] hover:underline"
              >
                + Add filter rule
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtersList.map((rule, idx) => (
                <div key={rule.id} className="flex flex-wrap items-center gap-2 relative">
                  <span className="text-[10px] font-black text-slate-400 uppercase w-10">
                    {idx === 0 ? "Where" : "AND"}
                  </span>
                  
                  {/* Select Filter Dropdown with Search */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdownRuleId(activeDropdownRuleId === rule.id ? null : rule.id)}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white inline-flex items-center gap-1.5"
                    >
                      <span>{rule.field}</span>
                      <ChevronDown size={10} />
                    </button>

                    {activeDropdownRuleId === rule.id && (
                      <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 flex flex-col max-h-[220px] overflow-hidden text-xs">
                        <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            value={filterFieldSearch}
                            onChange={(e) => setFilterFieldSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-[#0f1d31] text-[10px] font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
                          {FILTER_FIELDS.filter((f) => f.toLowerCase().includes(filterFieldSearch.toLowerCase())).map((f) => (
                            <button
                              key={f}
                              onClick={() => {
                                updateFilterRule(rule.id, { field: f as any, value: f === "Status" ? "On track" : f === "Priority" ? "Medium" : "All" });
                                setActiveDropdownRuleId(null);
                                setFilterFieldSearch("");
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operator Selector */}
                  <select
                    value={rule.operator}
                    onChange={() => {}}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none"
                  >
                    <option value="Is">Is</option>
                  </select>

                  {/* Value Selector */}
                  {rule.field === "Status" ? (
                    <select
                      value={rule.value}
                      onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none"
                    >
                      <option value="On track">On track</option>
                      <option value="At risk">At risk</option>
                      <option value="Off track">Off track</option>
                      <option value="On hold">On hold</option>
                      <option value="Complete">Complete</option>
                    </select>
                  ) : rule.field === "Priority" ? (
                    <select
                      value={rule.value}
                      onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={rule.value}
                      placeholder="Enter filter option..."
                      onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none"
                    />
                  )}

                  {/* Remove Rule */}
                  <button
                    onClick={() => removeFilterRule(rule.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <button
                  onClick={addFilterRule}
                  className="px-3 py-1.5 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-lg transition-all"
                >
                  + Add filter
                </button>
                <button
                  onClick={() => setFiltersList([])}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Assignee Filter Search Modal ── */}
      {showAssigneeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1c304a] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[420px]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#142843] dark:text-white">Filter by Assignee</h3>
              <button
                onClick={() => setShowAssigneeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  value={assigneeSearch}
                  onChange={(e) => setAssigneeSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#0f1d31] text-xs font-semibold text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]"
                />
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button
                onClick={() => { setSelectedAssignee("All"); setShowAssigneeModal(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                  selectedAssignee === "All"
                    ? "bg-blue-50 text-[#0f2d5a] dark:bg-blue-950/30"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200"
                }`}
              >
                All Assignees
              </button>
              {filteredAssignees.map((name) => (
                <button
                  key={name}
                  onClick={() => { setSelectedAssignee(name); setShowAssigneeModal(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                    selectedAssignee === name
                      ? "bg-blue-50 text-[#0f2d5a] dark:bg-blue-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  👤 {name}
                </button>
              ))}
            </div>

            {/* Assignee comments turn-on toggle footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                Assignee Comments
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAssigneeComments}
                  onChange={(e) => setEnableAssigneeComments(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-[#0f2d5a]"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
