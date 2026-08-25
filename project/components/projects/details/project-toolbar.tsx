"use client";

import {
  getActiveWorkspaceMembersAction,
  getProjectMembersAction,
} from "@/actions/member-actions";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { FilterOperator, FilterRule, SortOption } from "@/hooks/use-task-filters";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Filter,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Users2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

export interface ProjectToolbarProps {
  projectId?: string;
  onAddTask: (sectionId?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPriorityFilter?: string;
  setSelectedPriorityFilter?: (p: string) => void;
  selectedStatusFilter?: string;
  setSelectedStatusFilter?: (s: string) => void;
  filterRules?: FilterRule[];
  setFilterRules?: (rules: FilterRule[] | ((prev: FilterRule[]) => FilterRule[])) => void;
  selectedAssignee?: string;
  setSelectedAssignee?: (a: string) => void;
  availableAssignees?: string[];
  members?: { id: string; name: string; email?: string }[];
  sortBy: SortOption;
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

const FILTER_FIELDS: { label: string; value: string }[] = [
  { label: "Status", value: "Status" },
  { label: "Priority", value: "Priority" },
  { label: "Assignee", value: "Assignee" },
  { label: "Due date", value: "Due date" },
  { label: "Task Name", value: "Task Name" },
];

const OPERATORS_FOR_SELECT: FilterOperator[] = ["Is", "Is not", "Is set", "Is not set"];
const OPERATORS_FOR_TEXT: FilterOperator[] = [
  "Is",
  "Is not",
  "Contains",
  "Does not contain",
  "Is set",
  "Is not set",
];

const STATUS_VALUES = ["On track", "At risk", "Off track", "On hold", "Complete", "Dropped"];
const PRIORITY_VALUES = ["High", "Medium", "Low"];

export function ProjectToolbar({
  projectId,
  onAddTask,
  searchQuery,
  setSearchQuery,
  selectedPriorityFilter = "All",
  setSelectedPriorityFilter,
  selectedStatusFilter = "All",
  setSelectedStatusFilter,
  filterRules: externalFilterRules,
  setFilterRules: setExternalFilterRules,
  selectedAssignee = "All",
  setSelectedAssignee,
  availableAssignees,
  members,
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
  // Internal state if parent doesn't provide controlled rules
  const [internalFilterRules, setInternalFilterRules] = useState<FilterRule[]>([]);
  const filtersList = externalFilterRules ?? internalFilterRules;

  // Live member fetching via server action
  const [liveMembers, setLiveMembers] = useState<{ id: string; name: string; email?: string }[]>(
    [],
  );
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMembers() {
      if (members && members.length > 0) {
        setLiveMembers(members);
        return;
      }
      setIsLoadingMembers(true);
      try {
        if (projectId) {
          const res = await getProjectMembersAction(projectId);
          if (isMounted && res) {
            setLiveMembers(
              res.map((m) => ({ id: m.userId || m.id, name: m.name, email: m.email })),
            );
          }
        } else {
          const res = await getActiveWorkspaceMembersAction();
          if (isMounted && res) {
            setLiveMembers(
              res.map((m) => ({ id: m.userId || m.id, name: m.name, email: m.email })),
            );
          }
        }
      } catch (err) {
        console.error("[ProjectToolbar] Error loading members:", err);
      } finally {
        if (isMounted) setIsLoadingMembers(false);
      }
    }
    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [projectId, members]);

  // Combine passed props and live fetched members
  const memberList = useMemo(() => {
    const list: { id: string; name: string; email?: string }[] = [];
    const seen = new Set<string>();

    if (members) {
      for (const m of members) {
        if (m.name && !seen.has(m.name.toLowerCase())) {
          seen.add(m.name.toLowerCase());
          list.push(m);
        }
      }
    }

    for (const m of liveMembers) {
      if (m.name && !seen.has(m.name.toLowerCase())) {
        seen.add(m.name.toLowerCase());
        list.push(m);
      }
    }

    if (availableAssignees) {
      for (const name of availableAssignees) {
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({ id: name, name, email: "" });
        }
      }
    }

    return list;
  }, [members, liveMembers, availableAssignees]);

  const updateFilters = (newRules: FilterRule[]) => {
    if (setExternalFilterRules) {
      setExternalFilterRules(newRules);
    } else {
      setInternalFilterRules(newRules);
    }

    // Sync legacy filters if provided
    if (setSelectedPriorityFilter) {
      const priorityRule = newRules.find((r) => r.field === "Priority" && r.operator === "Is");
      setSelectedPriorityFilter(priorityRule ? priorityRule.value : "All");
    }
    if (setSelectedStatusFilter) {
      const statusRule = newRules.find((r) => r.field === "Status" && r.operator === "Is");
      setSelectedStatusFilter(statusRule ? statusRule.value : "All");
    }
  };

  // Filter Flyout Popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [activeDropdownRuleId, setActiveDropdownRuleId] = useState<string | null>(null);
  const [activeOperatorRuleId, setActiveOperatorRuleId] = useState<string | null>(null);
  const [activeValueRuleId, setActiveValueRuleId] = useState<string | null>(null);

  // Close filter flyout on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setShowFilterPanel(false);
        setActiveDropdownRuleId(null);
        setActiveOperatorRuleId(null);
        setActiveValueRuleId(null);
      }
    }
    if (showFilterPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterPanel]);

  // Assignee search dropdown state
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const [assigneeSearch, setAssigneeSearch] = useState("");

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target as Node)) {
        setShowAssigneeModal(false);
      }
    }
    if (showAssigneeModal) {
      document.addEventListener("mousedown", clickOutside);
    }
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [showAssigneeModal]);

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
    if (showSaveViewDropdown) {
      document.addEventListener("mousedown", clickOutside);
    }
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [showSaveViewDropdown]);

  const addFilterRule = () => {
    const newRule: FilterRule = {
      id: Math.random().toString(36).substring(2, 9),
      field: "Status",
      operator: "Is",
      value: "On track",
    };
    updateFilters([...filtersList, newRule]);
  };

  const updateFilterRule = (id: string, updates: Partial<FilterRule>) => {
    const updated = filtersList.map((r) => {
      if (r.id !== id) return r;
      const next = { ...r, ...updates };
      // Default initial value when field changes
      if (updates.field && updates.field !== r.field) {
        if (next.field === "Status") next.value = "On track";
        else if (next.field === "Priority") next.value = "Medium";
        else if (next.field === "Assignee") next.value = memberList[0]?.name || "";
        else next.value = "";
      }
      return next;
    });
    updateFilters(updated);
  };

  const removeFilterRule = (id: string) => {
    updateFilters(filtersList.filter((r) => r.id !== id));
  };

  const handleClearAllFilters = () => {
    updateFilters([]);
    if (setSelectedPriorityFilter) setSelectedPriorityFilter("All");
    if (setSelectedStatusFilter) setSelectedStatusFilter("All");
    if (setSelectedAssignee) setSelectedAssignee("All");
  };

  const filteredMembers = useMemo(() => {
    const q = assigneeSearch.toLowerCase().trim();
    if (!q) return memberList;
    return memberList.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email && m.email.toLowerCase().includes(q)),
    );
  }, [memberList, assigneeSearch]);

  const activeFilterCount = filtersList.length;

  return (
    <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 flex flex-col gap-3 relative z-20">
      {/* ── Toolbar Actions Row ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Left side Add Task button */}
        {!calendarMode && (
          <button
            type="button"
            onClick={() => onAddTask()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0033a0] hover:bg-[#002a80] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
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
              className="w-full pl-4 pr-9 py-2 bg-white dark:bg-[#14263e] border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0033a0] transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            ) : (
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={13}
              />
            )}
          </div>

          {/* ── Filter Button & Compact Flyout Popover ── */}
          <div className="relative" ref={filterPanelRef}>
            <button
              type="button"
              onClick={() => {
                setShowFilterPanel((prev) => !prev);
                setActiveDropdownRuleId(null);
                setActiveOperatorRuleId(null);
                setActiveValueRuleId(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilterCount > 0 || showFilterPanel
                  ? "border-[#0033a0] bg-blue-50/50 text-[#0033a0] dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Filter
                size={12}
                className={activeFilterCount > 0 ? "text-[#0033a0] dark:text-blue-400" : "opacity-70"}
              />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 bg-[#0033a0] dark:bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Compact Right-Anchored Filter Popover */}
            {showFilterPanel && (
              <div
                className="absolute right-0 top-full mt-2 w-[360px] sm:w-[440px] bg-white dark:bg-[#101f35] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-100"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Task Filters
                    </span>
                    {activeFilterCount > 0 && (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {activeFilterCount} rule{activeFilterCount > 1 ? "s" : ""} (AND)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {filtersList.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllFilters}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowFilterPanel(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Filter Rules List */}
                {filtersList.length === 0 ? (
                  <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/30">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                      No active filter rules
                    </p>
                    <button
                      type="button"
                      onClick={addFilterRule}
                      className="text-xs font-bold text-[#0033a0] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} /> Add filter rule
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">
                    {filtersList.map((rule, idx) => {
                      const isFieldDropdownOpen = activeDropdownRuleId === rule.id;
                      const isOperatorDropdownOpen = activeOperatorRuleId === rule.id;
                      const isValueDropdownOpen = activeValueRuleId === rule.id;

                      const isSelectOperator =
                        rule.operator === "Is set" || rule.operator === "Is not set";
                      const availableOperators =
                        rule.field === "Task Name" || rule.field === "Assignee"
                          ? OPERATORS_FOR_TEXT
                          : OPERATORS_FOR_SELECT;

                      return (
                        <div
                          key={rule.id}
                          className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                        >
                          {/* Prefix: Where / AND */}
                          <span className="text-[10px] font-bold text-slate-400 uppercase w-10 shrink-0 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1 rounded-md">
                            {idx === 0 ? "Where" : "AND"}
                          </span>

                          {/* Field Selector */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveDropdownRuleId(isFieldDropdownOpen ? null : rule.id);
                                setActiveOperatorRuleId(null);
                                setActiveValueRuleId(null);
                              }}
                              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white inline-flex items-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <span>{rule.field}</span>
                              <ChevronDown size={10} className="opacity-70" />
                            </button>

                            {isFieldDropdownOpen && (
                              <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs">
                                {FILTER_FIELDS.map((f) => (
                                  <button
                                    key={f.value}
                                    type="button"
                                    onClick={() => {
                                      updateFilterRule(rule.id, { field: f.value });
                                      setActiveDropdownRuleId(null);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                      rule.field === f.value
                                        ? "bg-blue-50 text-[#0033a0] dark:bg-blue-950/40 dark:text-blue-300 font-bold"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                                    }`}
                                  >
                                    <span>{f.label}</span>
                                    {rule.field === f.value && <Check size={11} />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Operator Selector */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveOperatorRuleId(isOperatorDropdownOpen ? null : rule.id);
                                setActiveDropdownRuleId(null);
                                setActiveValueRuleId(null);
                              }}
                              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white inline-flex items-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <span>{rule.operator}</span>
                              <ChevronDown size={10} className="opacity-70" />
                            </button>

                            {isOperatorDropdownOpen && (
                              <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs">
                                {availableOperators.map((op) => (
                                  <button
                                    key={op}
                                    type="button"
                                    onClick={() => {
                                      updateFilterRule(rule.id, { operator: op });
                                      setActiveOperatorRuleId(null);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                      rule.operator === op
                                        ? "bg-blue-50 text-[#0033a0] dark:bg-blue-950/40 dark:text-blue-300 font-bold"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                                    }`}
                                  >
                                    <span>{op}</span>
                                    {rule.operator === op && <Check size={11} />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Value Selector */}
                          <div className="relative flex-1 min-w-[100px]">
                            {isSelectOperator ? (
                              <div className="px-2.5 py-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 italic">
                                Any value
                              </div>
                            ) : rule.field === "Status" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveValueRuleId(isValueDropdownOpen ? null : rule.id);
                                    setActiveDropdownRuleId(null);
                                    setActiveOperatorRuleId(null);
                                  }}
                                  className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white inline-flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                  <span className="truncate">{rule.value || "Select status"}</span>
                                  <ChevronDown size={10} className="opacity-70 shrink-0 ml-1" />
                                </button>
                                {isValueDropdownOpen && (
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs">
                                    {STATUS_VALUES.map((st) => (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => {
                                          updateFilterRule(rule.id, { value: st });
                                          setActiveValueRuleId(null);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                          rule.value === st
                                            ? "bg-blue-50 text-[#0033a0] dark:bg-blue-950/40 dark:text-blue-300 font-bold"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                                        }`}
                                      >
                                        <span>{st}</span>
                                        {rule.value === st && <Check size={11} />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : rule.field === "Priority" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveValueRuleId(isValueDropdownOpen ? null : rule.id);
                                    setActiveDropdownRuleId(null);
                                    setActiveOperatorRuleId(null);
                                  }}
                                  className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white inline-flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                  <span className="truncate">{rule.value || "Select priority"}</span>
                                  <ChevronDown size={10} className="opacity-70 shrink-0 ml-1" />
                                </button>
                                {isValueDropdownOpen && (
                                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs">
                                    {PRIORITY_VALUES.map((pr) => (
                                      <button
                                        key={pr}
                                        type="button"
                                        onClick={() => {
                                          updateFilterRule(rule.id, { value: pr });
                                          setActiveValueRuleId(null);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                          rule.value === pr
                                            ? "bg-blue-50 text-[#0033a0] dark:bg-blue-950/40 dark:text-blue-300 font-bold"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                                        }`}
                                      >
                                        <span>{pr}</span>
                                        {rule.value === pr && <Check size={11} />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : rule.field === "Assignee" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveValueRuleId(isValueDropdownOpen ? null : rule.id);
                                    setActiveDropdownRuleId(null);
                                    setActiveOperatorRuleId(null);
                                  }}
                                  className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white inline-flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                  <span className="truncate">{rule.value || "Select member"}</span>
                                  <ChevronDown size={10} className="opacity-70 shrink-0 ml-1" />
                                </button>
                                {isValueDropdownOpen && (
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs max-h-48 overflow-y-auto">
                                    {memberList.length === 0 ? (
                                      <div className="py-2 text-center text-slate-400 text-xs">
                                        No members available
                                      </div>
                                    ) : (
                                      memberList.map((m) => (
                                        <button
                                          key={m.id || m.name}
                                          type="button"
                                          onClick={() => {
                                            updateFilterRule(rule.id, { value: m.name });
                                            setActiveValueRuleId(null);
                                          }}
                                          className={`w-full text-left px-3 py-1.5 font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                            rule.value === m.name
                                              ? "bg-blue-50 text-[#0033a0] dark:bg-blue-950/40 dark:text-blue-300 font-bold"
                                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                                          }`}
                                        >
                                          <span className="truncate">{m.name}</span>
                                          {rule.value === m.name && <Check size={11} />}
                                        </button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <input
                                type="text"
                                value={rule.value}
                                placeholder={
                                  rule.field === "Due date"
                                    ? "e.g. Aug 20 or 2026-08"
                                    : "Enter value..."
                                }
                                onChange={(e) =>
                                  updateFilterRule(rule.id, { value: e.target.value })
                                }
                                className="w-full px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none focus:border-[#0033a0]"
                              />
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => removeFilterRule(rule.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                            title="Remove filter"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Popover Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={addFilterRule}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#0033a0] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus size={12} /> Add filter
                  </button>
                  {filtersList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assignee Search modal trigger */}
          <div className="relative" ref={assigneeDropdownRef}>
            <button
              type="button"
              onClick={() => setShowAssigneeModal(!showAssigneeModal)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAssignee !== "All"
                  ? "border-[#0033a0] bg-blue-50/50 text-[#0033a0] dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
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
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-60">
                  <button
                    type="button"
                    onClick={() => {
                      if (setSelectedAssignee) setSelectedAssignee("All");
                      setShowAssigneeModal(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      selectedAssignee === "All"
                        ? "bg-blue-50 text-[#0033a0] dark:bg-blue-950/30 dark:text-blue-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>All Assignees</span>
                    {selectedAssignee === "All" && <Check size={11} />}
                  </button>

                  {isLoadingMembers && memberList.length === 0 ? (
                    <div className="py-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Loading members...</span>
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">No members found</div>
                  ) : (
                    filteredMembers.map((m) => (
                      <button
                        key={m.id || m.name}
                        type="button"
                        onClick={() => {
                          if (setSelectedAssignee) setSelectedAssignee(m.name);
                          setShowAssigneeModal(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          selectedAssignee === m.name
                            ? "bg-blue-50 text-[#0033a0] dark:bg-blue-950/30 dark:text-blue-300"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar name={m.name} size="xs" />
                          <div className="min-w-0">
                            <span className="block truncate">{m.name}</span>
                            {m.email && m.email !== "—" && (
                              <span className="block text-[10px] text-slate-400 truncate">{m.email}</span>
                            )}
                          </div>
                        </div>
                        {selectedAssignee === m.name && <Check size={11} className="shrink-0" />}
                      </button>
                    ))
                  )}
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
                        type="button"
                        onClick={() => setShowSaveViewDropdown((v) => !v)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-l-xl text-xs font-bold border-2 border-amber-500 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 size={12} />
                        <span>Save view</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSaveViewDropdown((v) => !v)}
                        className="px-2 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-r-xl text-xs font-bold border-2 border-amber-500 border-l-amber-400/50 transition-colors cursor-pointer"
                      >
                        <ChevronDown size={11} />
                      </button>
                    </div>
                    {/* Dropdown */}
                    {showSaveViewDropdown && (
                      <div
                        className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 text-xs overflow-hidden"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowSaveViewDropdown(false);
                            onSaveView?.();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                        >
                          <CheckCircle2 size={13} className="text-slate-400" /> Save view
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSaveViewDropdown(false);
                            onEnableAutosave?.();
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold cursor-pointer ${
                            autosaveEnabled
                              ? "text-[#0052cc] dark:text-sky-400"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <Save
                            size={13}
                            className={autosaveEnabled ? "text-[#0052cc]" : "text-slate-400"}
                          />
                          {autosaveEnabled ? "Autosave: On" : "Enable Autosave"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSaveViewDropdown(false);
                            onSaveAsNewView?.();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                        >
                          <Plus size={13} className="text-slate-400" /> Save as new view
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setShowSaveViewDropdown(false);
                            onRevertClosedTasks?.();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-rose-500 font-semibold cursor-pointer"
                        >
                          <RotateCcw size={13} /> Revert changes
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Closed toggle */}
                <button
                  type="button"
                  onClick={onToggleClosedTasks}
                  title="Quickly show closed tasks"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
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
                  type="button"
                  onClick={() => setShowClosedDropdown(!showClosedDropdown)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
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
    </div>
  );
}
