"use client";

import {
  CheckCircle2,
  ChevronDown,
  Filter,
  HelpCircle,
  MessageSquare,
  Plus,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
  Users2,
  X,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface ProjectToolbarProps {
  onAddTask: (sectionId?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (p: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (s: string) => void;
  sortBy: "default" | "name" | "priority" | "assignee" | "dueDate";
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
  field:
    | "Status"
    | "Tags"
    | "Due date"
    | "Priority"
    | "Assignee"
    | "Archived"
    | "Assigned comment"
    | "Created by"
    | "Date closed"
    | "Date created";
  operator: "Is";
  value: string;
}

const AVAILABLE_ASSIGNEES = ["Ellen Grace Sinday", "John Doe", "Jane Smith", "Bob Johnson"];

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
  const [activeOperatorRuleId, setActiveOperatorRuleId] = useState<string | null>(null);
  const [activeValueRuleId, setActiveValueRuleId] = useState<string | null>(null);
  const [filterValueSearch, setFilterValueSearch] = useState("");

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
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("All");
  const [enableAssigneeComments, setEnableAssigneeComments] = useState(false);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target as Node)) {
        setShowAssigneeModal(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

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
    setFiltersList(filtersList.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeFilterRule = (id: string) => {
    setFiltersList(filtersList.filter((r) => r.id !== id));
  };

  const filteredAssignees = AVAILABLE_ASSIGNEES.filter((name) =>
    name.toLowerCase().includes(assigneeSearch.toLowerCase()),
  );

  const filteredSortOptions = SORT_OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(sortSearch.toLowerCase()),
  );

  return (
    <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 flex flex-col gap-3 relative z-20">
      {/* ── Toolbar Actions Row ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Left side Add Task button */}
        {!calendarMode && (
          <button
            onClick={() => onAddTask()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f2d5a] hover:bg-[#0c2447] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus size={14} /> Add task
          </button>
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
          <div className="relative" ref={assigneeDropdownRef}>
            <button
              onClick={() => setShowAssigneeModal(!showAssigneeModal)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Users2 size={12} className="opacity-70" />
              <span>Assignee: {selectedAssignee}</span>
            </button>
            {showAssigneeModal && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 flex flex-col max-h-[350px] overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={assigneeSearch}
                      onChange={(e) => setAssigneeSearch(e.target.value)}
                      placeholder="Search members..."
                      className="w-full pl-7 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#0f1d31] text-[11px] font-semibold text-[#142843] dark:text-white focus:outline-none"
                    />
                    <Search
                      size={12}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedAssignee("All");
                      setShowAssigneeModal(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
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
                      onClick={() => {
                        setSelectedAssignee(name);
                        setShowAssigneeModal(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        selectedAssignee === name
                          ? "bg-blue-50 text-[#0f2d5a] dark:bg-blue-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        {name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Assignee comments turn-on toggle footer */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-slate-400" />
                    Comments
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAssigneeComments}
                      onChange={(e) => setEnableAssigneeComments(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-6 h-3.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-[12px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all dark:border-slate-600 peer-checked:bg-[#0f2d5a]"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Closed button — behaviour differs by tab mode */}
          {!hideClosed &&
            (tableMode ? (
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
                          onClick={() => {
                            setShowSaveViewDropdown(false);
                            onSaveView?.();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold"
                        >
                          <CheckCircle2 size={13} className="text-slate-400" /> Save view
                        </button>
                        <button
                          onClick={() => {
                            setShowSaveViewDropdown(false);
                            onEnableAutosave?.();
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold ${autosaveEnabled ? "text-[#0052cc] dark:text-sky-400" : "text-slate-700 dark:text-slate-200"}`}
                        >
                          <Save
                            size={13}
                            className={autosaveEnabled ? "text-[#0052cc]" : "text-slate-400"}
                          />
                          {autosaveEnabled ? "Autosave: On" : "Enable Autosave"}
                        </button>
                        <button
                          onClick={() => {
                            setShowSaveViewDropdown(false);
                            onSaveAsNewView?.();
                          }}
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
                  <CheckCircle2
                    size={12}
                    className={showClosedTasks ? "text-white" : "text-violet-500"}
                  />
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
                  <CheckCircle2
                    size={12}
                    className={showClosedDropdown ? "text-white" : "text-violet-500"}
                  />
                  <span>Closed</span>
                </button>

                {showClosedDropdown && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-2 text-xs overflow-hidden">
                    {/* Tasks toggle */}
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Tasks
                      </span>
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
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Subtasks
                      </span>
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
                        { id: "p1", field: "Priority", operator: "Is", value: "High" },
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
                      onClick={() =>
                        setActiveDropdownRuleId(activeDropdownRuleId === rule.id ? null : rule.id)
                      }
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
                          {FILTER_FIELDS.filter((f) =>
                            f.toLowerCase().includes(filterFieldSearch.toLowerCase()),
                          ).map((f) => (
                            <button
                              key={f}
                              onClick={() => {
                                updateFilterRule(rule.id, {
                                  field: f as any,
                                  value:
                                    f === "Status"
                                      ? "On track"
                                      : f === "Priority"
                                        ? "Medium"
                                        : "All",
                                });
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
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveOperatorRuleId(activeOperatorRuleId === rule.id ? null : rule.id)
                      }
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white inline-flex items-center gap-1.5"
                    >
                      <span>{rule.operator}</span>
                      <ChevronDown size={10} />
                    </button>

                    {activeOperatorRuleId === rule.id && (
                      <div className="absolute left-0 mt-1 w-32 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 flex flex-col py-1 text-xs">
                        {["Is", "Is not", "Is set", "Is not set"].map((op) => (
                          <button
                            key={op}
                            onClick={() => {
                              updateFilterRule(rule.id, { operator: op as any });
                              setActiveOperatorRuleId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between"
                          >
                            {op}
                            {rule.operator === op && (
                              <CheckCircle2 size={12} className="text-violet-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Value Selector */}
                  <div className="relative flex-1 min-w-[160px]">
                    {rule.field === "Status" || rule.field === "Priority" ? (
                      <button
                        onClick={() =>
                          setActiveValueRuleId(activeValueRuleId === rule.id ? null : rule.id)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white inline-flex items-center gap-1.5 justify-between"
                      >
                        <span>{rule.value || "Select option"}</span>
                        <ChevronDown size={10} />
                      </button>
                    ) : (
                      <input
                        type="text"
                        value={rule.value}
                        placeholder="Enter filter option..."
                        onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none"
                      />
                    )}

                    {activeValueRuleId === rule.id &&
                      (rule.field === "Status" || rule.field === "Priority") && (
                        <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 flex flex-col max-h-[220px] overflow-hidden text-xs">
                          <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                            <input
                              type="text"
                              value={filterValueSearch}
                              onChange={(e) => setFilterValueSearch(e.target.value)}
                              placeholder="Search..."
                              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-[#0f1d31] text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-slate-400">
                            <span>{rule.field === "Status" ? "Statuses" : "Priorities"}</span>
                            <button className="text-violet-500 hover:text-violet-600 font-semibold">
                              Select All
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
                            {(rule.field === "Status"
                              ? ["On track", "At risk", "Off track", "On hold", "Complete"]
                              : ["High", "Medium", "Low"]
                            )
                              .filter((f) =>
                                f.toLowerCase().includes(filterValueSearch.toLowerCase()),
                              )
                              .map((f) => (
                                <label
                                  key={f}
                                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                                >
                                  <div
                                    className="flex items-center justify-center w-3 h-3 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500 data-[state=checked]:text-white"
                                    data-state={rule.value === f ? "checked" : "unchecked"}
                                  >
                                    {rule.value === f && <CheckCircle2 size={10} />}
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={rule.value === f}
                                    onChange={() => {
                                      updateFilterRule(rule.id, { value: f });
                                      setActiveValueRuleId(null);
                                    }}
                                    className="sr-only"
                                  />
                                  {f}
                                </label>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>

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
    </div>
  );
}
