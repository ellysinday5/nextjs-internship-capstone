import type { Section } from "@/components/projects/details/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export type SortOption = "default" | "name" | "priority" | "assignee" | "dueDate";

export type TableViewState = {
  searchQuery: string;
  selectedPriorityFilter: string;
  selectedStatusFilter: string;
  sortBy: string;
  showClosedTasks: boolean;
};

export function useTaskFilters(resolvedProjectId: string | null, sections: Section[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
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
      sortBy,
      showClosedTasks,
    }),
    [searchQuery, selectedPriorityFilter, selectedStatusFilter, sortBy, showClosedTasks],
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
    sortBy,
    showClosedTasks,
    currentTableView,
  ]);

  const filteredSections = useMemo(() => {
    const PRIORITY_RANK: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
    return sections.map((sec) => {
      let filtered = sec.tasks.filter((task) => {
        const matchesSearch =
          !searchQuery.trim() || task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority =
          selectedPriorityFilter === "All" || task.priority === selectedPriorityFilter;
        const matchesStatus =
          selectedStatusFilter === "All" || task.status === selectedStatusFilter;
        return matchesSearch && matchesPriority && matchesStatus;
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
  }, [sections, searchQuery, selectedPriorityFilter, selectedStatusFilter, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
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
