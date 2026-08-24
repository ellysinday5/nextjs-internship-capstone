"use client";

import { type ProjectWithStats, getProjectsAction } from "@/actions/project-actions";
import { type TaskRecord, getProjectTasksAction } from "@/actions/task-actions";
import { toSlug } from "@/lib/project-data";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Filter,
  History,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SearchResultItem {
  id: string;
  name: string;
  subtitle?: string;
  category: "Tasks" | "Projects" | "People";
  url: string;
  badge?: string;
  avatar?: string;
  color?: string;
  status?: string;
  priority?: string;
}

export interface RecentSearchItem {
  id: string;
  query: string;
  category?: string;
  url?: string;
  timestamp: number;
}

const LOCAL_STORAGE_RECENTS_KEY = "syntraflow_recent_searches_v2";

export function HeaderSearchModal({ isOpen, onClose }: HeaderSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");

  // Real database workspace datasets
  const [dbProjects, setDbProjects] = useState<ProjectWithStats[]>([]);
  const [dbTasks, setDbTasks] = useState<(TaskRecord & { projectName: string })[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Real recent searches stored in localStorage
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load recent searches from localStorage", e);
    }
  }, []);

  // Fetch real workspace projects & tasks when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setLoadingDb(true);

      getProjectsAction()
        .then(async (projectsList) => {
          if (Array.isArray(projectsList)) {
            setDbProjects(projectsList);

            // Fetch tasks across all projects
            const allTasksPromises = projectsList.map(async (p) => {
              try {
                const tasks = await getProjectTasksAction(p.id);
                return tasks.map((t) => ({ ...t, projectName: p.name }));
              } catch {
                return [];
              }
            });

            const tasksArrays = await Promise.all(allTasksPromises);
            setDbTasks(tasksArrays.flat());
          }
        })
        .catch((err) => {
          console.error("Failed to fetch search data:", err);
        })
        .finally(() => {
          setLoadingDb(false);
        });
    }
  }, [isOpen]);

  // Keyboard listeners: Escape & Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Helper to persist recent searches to localStorage
  const saveRecentSearch = (searchTerm: string, url?: string, category?: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // Remove duplicates
      const filtered = prev.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase());

      const newItem: RecentSearchItem = {
        id: `recent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        query: trimmed,
        category: category || "Search",
        url,
        timestamp: Date.now(),
      };

      const updated = [newItem, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(LOCAL_STORAGE_RECENTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent search to localStorage", e);
      }
      return updated;
    });
  };

  // Remove a single recent search item
  const handleRemoveRecentItem = (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.id !== idToRemove);
      try {
        localStorage.setItem(LOCAL_STORAGE_RECENTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update recent searches in localStorage", e);
      }
      return updated;
    });
  };

  // Clear all recent searches
  const handleClearAllRecents = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_RECENTS_KEY);
    } catch (e) {
      console.error("Failed to clear recent searches from localStorage", e);
    }
  };

  // Handle clicking a search result item
  const handleSelectItem = (item: SearchResultItem) => {
    saveRecentSearch(item.name, item.url, item.category);
    onClose();
    router.push(item.url);
  };

  // Handle pressing Enter in the search input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      saveRecentSearch(
        query.trim(),
        undefined,
        selectedCategory !== "All" ? selectedCategory : "Search",
      );
    }
  };

  // Handle clicking a recent search tag/row
  const handleSelectRecent = (recent: RecentSearchItem) => {
    if (recent.url) {
      onClose();
      router.push(recent.url);
    } else {
      setQuery(recent.query);
      if (recent.category && recent.category !== "Search") {
        setSelectedCategory(recent.category);
      }
    }
  };

  const categories = [
    { label: "Tasks", icon: CheckCircle2 },
    { label: "Projects", icon: ClipboardList },
    { label: "People", icon: User },
  ];

  // Convert real workspace DB data into searchable items
  const realProjects: SearchResultItem[] = useMemo(() => {
    return dbProjects.map((p) => ({
      id: `real-proj-${p.id}`,
      name: p.name,
      subtitle: p.description || `Project • ${p.taskCount || 0} tasks`,
      category: "Projects",
      url: `/projects/${toSlug(p.name)}`,
      badge: p.status || "Active",
      avatar: p.name.substring(0, 2).toUpperCase(),
      color: "bg-[#00b4d8] text-white",
      status: p.status,
      priority: p.priority,
    }));
  }, [dbProjects]);

  const realTasks: SearchResultItem[] = useMemo(() => {
    return dbTasks.map((t) => ({
      id: `real-task-${t.id}`,
      name: t.title,
      subtitle: `In ${t.projectName} • ${t.assignee ? `Assigned to ${t.assignee.name}` : "Unassigned"}`,
      category: "Tasks",
      url: `/projects/${toSlug(t.projectName)}`,
      badge: t.status || t.priority || "Task",
      status: t.status || undefined,
      priority: t.priority || undefined,
    }));
  }, [dbTasks]);

  // Combine real items
  const allRealItems: SearchResultItem[] = useMemo(() => {
    return [...realProjects, ...realTasks];
  }, [realProjects, realTasks]);

  // Filter real items based on query & category
  const filteredItems = useMemo(() => {
    let list = allRealItems;

    if (selectedCategory !== "All") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          (item.badge && item.badge.toLowerCase().includes(q)),
      );
    }

    if (statusFilter !== "All") {
      list = list.filter((item) => item.status === statusFilter || item.badge === statusFilter);
    }

    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [allRealItems, selectedCategory, query, statusFilter, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-3 sm:pt-6 px-4 animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-[#14263e] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
      >
        {/* ── Top Search Input Box ── */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="relative flex items-center bg-white dark:bg-[#0f1f33] border-2 border-[#3151b7] dark:border-[#00b4d8] rounded-full px-4 py-2.5 shadow-sm transition-all">
            <Search size={18} className="text-slate-400 dark:text-slate-300 mr-2.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search your real projects and tasks..."
              className="w-full bg-transparent text-sm font-medium text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              suppressHydrationWarning
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 mr-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Clear search text"
                suppressHydrationWarning
              >
                <X size={16} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowFilterDrawer((v) => !v)}
              className={`p-1.5 rounded-full transition-colors ${
                showFilterDrawer
                  ? "bg-[#00b4d8] text-white"
                  : "text-slate-500 hover:text-[#00b4d8] hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Search filters"
              aria-label="Search filters"
              suppressHydrationWarning
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-2 mt-3.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === "All"
                  ? "border-[#142843] bg-[#142843] text-white dark:border-[#00b4d8] dark:bg-[#00b4d8] dark:text-[#08131f]"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c304a] hover:border-[#00b4d8] hover:text-[#00b4d8]"
              }`}
              suppressHydrationWarning
            >
              <Sparkles size={13} />
              <span>All</span>
            </button>
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "border-[#142843] bg-[#142843] text-white dark:border-[#00b4d8] dark:bg-[#00b4d8] dark:text-[#08131f]"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c304a] hover:border-[#00b4d8] hover:text-[#00b4d8]"
                  }`}
                  suppressHydrationWarning
                >
                  {IconComponent && <IconComponent size={14} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Optional Filter Drawer */}
          {showFilterDrawer && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0f1d31] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-2">
                <Filter size={13} className="text-[#00b4d8]" />
                <span className="font-semibold text-slate-600 dark:text-slate-300">Status:</span>
                {["All", "In Progress", "Completed", "On track"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      statusFilter === st
                        ? "bg-[#00b4d8] text-white font-bold"
                        : "bg-white dark:bg-[#1c304a] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1 font-medium text-xs focus:outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Content Body ── */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1">
          {/* Recent Searches Section (Only shown if user actually has real recent searches in localStorage) */}
          {!query.trim() && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <History size={14} className="text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Recent Searches
                  </h4>
                </div>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllRecents}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              {recentSearches.length > 0 ? (
                <div className="space-y-1.5">
                  {recentSearches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectRecent(item)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c304a] transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <History
                          size={14}
                          className="text-slate-400 shrink-0 group-hover:text-[#00b4d8] transition-colors"
                        />
                        <span className="text-xs font-semibold text-[#142843] dark:text-slate-100 group-hover:text-[#00b4d8] transition-colors truncate">
                          {item.query}
                        </span>
                        {item.category && item.category !== "Search" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Remove single recent search X button */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveRecentItem(e, item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all opacity-80 group-hover:opacity-100"
                        title="Remove from recent searches"
                        aria-label="Remove search item"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 px-4 text-center rounded-2xl bg-slate-50/50 dark:bg-[#0f1d31]/40 border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-400">No recent searches yet.</p>
                  <p className="text-[11px] text-slate-400/80 mt-0.5">
                    Search for a project or task above to get started.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Search Results List (Shown when typing or filtering) ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {query.trim()
                  ? `Search Results (${filteredItems.length})`
                  : `All Workspace Items (${filteredItems.length})`}
              </h4>
              {loadingDb && (
                <span className="text-[11px] text-slate-400 animate-pulse">
                  Loading workspace items...
                </span>
              )}
            </div>

            {filteredItems.length > 0 ? (
              <div className="space-y-1.5">
                {filteredItems.map((item) => {
                  let CategoryIcon = ClipboardList;
                  if (item.category === "Tasks") CategoryIcon = CheckCircle2;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1c304a] transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {item.avatar ? (
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                              item.color || "bg-[#00b4d8] text-white"
                            } shrink-0 shadow-xs`}
                          >
                            {item.avatar}
                          </span>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 group-hover:bg-[#00b4d8]/10 group-hover:text-[#00b4d8] transition-colors">
                            <CategoryIcon size={16} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#142843] dark:text-slate-100 group-hover:text-[#00b4d8] transition-colors truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                              {item.category}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {item.badge && (
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                              item.badge === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                                : item.badge === "In Progress" || item.badge === "On track"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                                  : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          size={15}
                          className="text-slate-300 dark:text-slate-600 group-hover:text-[#00b4d8] group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50/50 dark:bg-[#0f1d31]/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Search size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {loadingDb ? "Loading items..." : "No matching items found"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try typing a different keyword or switching categories.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-200">
                ESC
              </kbd>{" "}
              to close
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-200">
                Enter
              </kbd>{" "}
              to save search
            </span>
          </div>
          <span>SyntraFlow Real-Time Search</span>
        </div>
      </div>
    </div>
  );
}
