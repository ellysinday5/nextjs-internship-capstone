import type { Section } from "@/components/projects/details/types";
import type { TaskItem } from "@/components/tasks/task-details";
import { useCallback, useEffect, useMemo, useState } from "react";

export type SortOption = "default" | "name" | "priority" | "assignee" | "dueDate";

export type FilterOperator =
  | "Is"
  | "Is not"
  | "Is set"
  | "Is not set"
  | "Contains"
  | "Does not contain";

export interface FilterRule {
  id: string;
  field: "Status" | "Priority" | "Assignee" | "Due date" | "Task Name" | "Tags" | string;
  operator: FilterOperator;
  value: string;
}

export type TableViewState = {
  searchQuery: string;
  selectedPriorityFilter: string;
  selectedStatusFilter: string;
  selectedAssignee?: string;
  filterRules?: FilterRule[];
  sortBy: string;
  showClosedTasks: boolean;
};

/**
 * Evaluates whether a TaskItem satisfies a single FilterRule.
 */
export function matchFilterRule(task: TaskItem, rule: FilterRule): boolean {
  const field = rule.field;
  const op = rule.operator;
  const val = (rule.value || "").trim().toLowerCase();

  switch (field) {
    case "Status": {
      const taskStatus = (task.status || "").trim().toLowerCase();
      if (op === "Is") return taskStatus === val;
      if (op === "Is not") return taskStatus !== val;
      if (op === "Is set") return Boolean(task.status && task.status.trim() !== "");
      if (op === "Is not set") return !task.status || task.status.trim() === "";
      return true;
    }
    case "Priority": {
      const taskPriority = (task.priority || "").trim().toLowerCase();
      if (op === "Is") return taskPriority === val;
      if (op === "Is not") return taskPriority !== val;
      if (op === "Is set") return Boolean(task.priority && task.priority.trim() !== "");
      if (op === "Is not set") return !task.priority || task.priority.trim() === "";
      return true;
    }
    case "Assignee": {
      const taskAssignee = (task.assignee?.name || "").trim().toLowerCase();
      if (op === "Is") {
        return taskAssignee === val || taskAssignee.includes(val);
      }
      if (op === "Is not") {
        return taskAssignee !== val && !taskAssignee.includes(val);
      }
      if (op === "Contains") return taskAssignee.includes(val);
      if (op === "Does not contain") return !taskAssignee.includes(val);
      if (op === "Is set") return Boolean(task.assignee?.name || task.assignee?.id);
      if (op === "Is not set") return !task.assignee?.name && !task.assignee?.id;
      return true;
    }
    case "Due date": {
      const dueDateDisplay = (task.dueDate || "").trim().toLowerCase();
      const dueDateISO = (task.dueDateISO || "").trim().toLowerCase();
      if (op === "Is") {
        return dueDateDisplay.includes(val) || dueDateISO.includes(val);
      }
      if (op === "Is not") {
        return !dueDateDisplay.includes(val) && !dueDateISO.includes(val);
      }
      if (op === "Is set") return Boolean(task.dueDate || task.dueDateISO);
      if (op === "Is not set") return !task.dueDate && !task.dueDateISO;
      return true;
    }
    case "Task Name":
    case "Name":
    case "Title": {
      const title = (task.title || "").trim().toLowerCase();
      if (op === "Is") return title === val;
      if (op === "Is not") return title !== val;
      if (op === "Contains") return title.includes(val);
      if (op === "Does not contain") return !title.includes(val);
      if (op === "Is set") return title.length > 0;
      if (op === "Is not set") return title.length === 0;
      return true;
    }
    default: {
      if (op === "Is set") return true;
      if (op === "Is not set") return false;
      return true;
    }
  }
}

export function useTaskFilters(resolvedProjectId: string | null, sections: Section[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedAssignee, setSelectedAssignee] = useState("All");
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showClosedTasks, setShowClosedTasks] = useState(false);

  const tableViewKey = resolvedProjectId ? `syntraflow_table_view_${resolvedProjectId}` : null;
  const autosaveKey = resolvedProjectId ? `syntraflow_table_autosave_${resolvedProjectId}` : null;

  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const [savedView, setSavedView] = useState<TableViewState | null>(null);

  // Load saved view + autosave pref on mount
  useEffect(() => {
    if (!tableViewKey || !autosaveKey) return;
    try {
      const stored = localStorage.getItem(tableViewKey);
      if (stored) {
        const v: TableViewState = JSON.parse(stored);
        setSearchQuery(v.searchQuery ?? "");
        setSelectedPriorityFilter(v.selectedPriorityFilter ?? "All");
        setSelectedStatusFilter(v.selectedStatusFilter ?? "All");
        setSelectedAssignee(v.selectedAssignee ?? "All");
        if (Array.isArray(v.filterRules)) {
          setFilterRules(v.filterRules);
        }
        setSortBy((v.sortBy as SortOption) ?? "default");
        setShowClosedTasks(v.showClosedTasks ?? false);
        setSavedView(v);
      }
      const as = localStorage.getItem(autosaveKey);
      if (as === "true") setAutosaveEnabled(true);
    } catch {}
  }, [tableViewKey, autosaveKey]);

  const currentTableView = useCallback(
    (): TableViewState => ({
      searchQuery,
      selectedPriorityFilter,
      selectedStatusFilter,
      selectedAssignee,
      filterRules,
      sortBy,
      showClosedTasks,
    }),
    [
      searchQuery,
      selectedPriorityFilter,
      selectedStatusFilter,
      selectedAssignee,
      filterRules,
      sortBy,
      showClosedTasks,
    ],
  );

  const handleSaveView = useCallback(() => {
    if (!tableViewKey) return;
    const v = currentTableView();
    try {
      localStorage.setItem(tableViewKey, JSON.stringify(v));
    } catch {}
    setSavedView(v);
  }, [tableViewKey, currentTableView]);

  const handleEnableAutosave = useCallback(() => {
    if (!autosaveKey) return;
    const next = !autosaveEnabled;
    setAutosaveEnabled(next);
    try {
      localStorage.setItem(autosaveKey, String(next));
    } catch {}
    if (next) handleSaveView(); // save immediately when turning on
  }, [autosaveKey, autosaveEnabled, handleSaveView]);

  const handleSaveAsNewView = useCallback(() => {
    handleSaveView();
  }, [handleSaveView]);

  const handleRevertClosedTasks = useCallback(() => {
    if (savedView) {
      setSearchQuery(savedView.searchQuery);
      setSelectedPriorityFilter(savedView.selectedPriorityFilter);
      setSelectedStatusFilter(savedView.selectedStatusFilter);
      setSelectedAssignee(savedView.selectedAssignee ?? "All");
      setFilterRules(savedView.filterRules ?? []);
      setSortBy(savedView.sortBy as SortOption);
      setShowClosedTasks(savedView.showClosedTasks);
    } else {
      setShowClosedTasks(false);
    }
  }, [savedView]);

  // Autosave: persist whenever filters change (only when autosave is on)
  useEffect(() => {
    if (!autosaveEnabled || !tableViewKey) return;
    const v = currentTableView();
    try {
      localStorage.setItem(tableViewKey, JSON.stringify(v));
    } catch {}
    setSavedView(v);
  }, [
    autosaveEnabled,
    tableViewKey,
    searchQuery,
    selectedPriorityFilter,
    selectedStatusFilter,
    selectedAssignee,
    filterRules,
    sortBy,
    showClosedTasks,
    currentTableView,
  ]);

  const filteredSections = useMemo(() => {
    const PRIORITY_RANK: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
    return sections.map((sec) => {
      let filtered = sec.tasks.filter((task) => {
        // 1. Search Query
        const matchesSearch =
          !searchQuery.trim() ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // 2. Direct Priority Filter (if set to specific priority)
        const matchesPriority =
          !selectedPriorityFilter ||
          selectedPriorityFilter === "All" ||
          task.priority === selectedPriorityFilter;

        // 3. Direct Status Filter (if set to specific status)
        const matchesStatus =
          !selectedStatusFilter ||
          selectedStatusFilter === "All" ||
          task.status === selectedStatusFilter;

        // 4. Direct Assignee Filter
        const matchesAssignee =
          !selectedAssignee ||
          selectedAssignee === "All" ||
          (task.assignee?.name ?? "").toLowerCase() === selectedAssignee.toLowerCase();

        // 5. Multi-rule Filter Predicate (Combined with AND logic across all rules)
        const matchesRules =
          filterRules.length === 0 ||
          filterRules.every((rule) => matchFilterRule(task, rule));

        return (
          matchesSearch &&
          matchesPriority &&
          matchesStatus &&
          matchesAssignee &&
          matchesRules
        );
      });

      // Apply sort
      switch (sortBy) {
        case "name":
          filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "priority":
          filtered = [...filtered].sort(
            (a, b) =>
              (PRIORITY_RANK[a.priority ?? "Low"] || 9) - (PRIORITY_RANK[b.priority ?? "Low"] || 9),
          );
          break;
        case "assignee":
          filtered = [...filtered].sort((a, b) =>
            (a.assignee?.name ?? "").localeCompare(b.assignee?.name ?? ""),
          );
          break;
        case "dueDate":
          filtered = [...filtered].sort((a, b) => {
            const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
            const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
            return da - db;
          });
          break;
        default:
          break;
      }
      return { ...sec, tasks: filtered };
    });
  }, [
    sections,
    searchQuery,
    selectedPriorityFilter,
    selectedStatusFilter,
    selectedAssignee,
    filterRules,
    sortBy,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    selectedAssignee,
    setSelectedAssignee,
    filterRules,
    setFilterRules,
    sortBy,
    setSortBy,
    showClosedTasks,
    setShowClosedTasks,
    autosaveEnabled,
    handleEnableAutosave,
    savedView,
    handleSaveView,
    handleSaveAsNewView,
    handleRevertClosedTasks,
    filteredSections,
  };
}
