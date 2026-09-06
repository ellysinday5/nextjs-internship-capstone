"use client";

import { getProjectsAction } from "@/actions/project-actions";
import { getTasksForProjectsAction } from "@/actions/task-actions";
import { CalendarGrid, SelectedDayChip } from "@/components/calendar/calendar-grid";
import { EventsList } from "@/components/calendar/events-list";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { StatCard } from "@/components/ui/stat-card";
import { useCategories } from "@/context/category-context";
import {
  type CalendarEventItem,
  getCalendarStorageKey,
  loadCleanEvents,
  saveCleanEvents,
} from "@/lib/calendar-storage";
import { isTaskCompleted } from "@/lib/project-stats";
import { useUser } from "@clerk/nextjs";
import {
  Archive,
  CalendarDays,
  ChevronDown,
  Clock,
  FileEdit,
  Filter,
  Flame,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";

export type EventItem = CalendarEventItem;

function priorityBadge(p?: string) {
  if (p === "High")
    return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
  if (p === "Medium")
    return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useUser();
  const { eventCategoryNames } = useCategories();
  const storageKey = getCalendarStorageKey(user?.id);

  // Start from an empty array — no hardcoded seed data.
  // Events are populated from two workspace-scoped sources:
  //   1. User-created custom events (localStorage, scoped to user)
  //   2. Task due-dates fetched from the DB via getTasksForProjectsAction
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<"delete" | "logout" | "save" | "discard">(
    "delete",
  );
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    type: "archive" | "delete";
    id: string;
  } | null>(null);

  useEffect(() => {
    // 1. Load user-created custom events from localStorage (purges any legacy mock data)
    const stored = loadCleanEvents(storageKey);
    setEvents(stored);

    // 2. Fetch task due-dates from the DB, workspace-scoped via getProjectsAction.
    //    getProjectsAction already resolves the active workspace and returns only
    //    projects belonging to it, so the projectIds passed to the batched action
    //    are guaranteed to be workspace-scoped.
    getProjectsAction()
      .then(async (projectsList) => {
        if (!Array.isArray(projectsList) || projectsList.length === 0) return;

        const projectIds = projectsList.map((p) => p.id);
        const allTasks = await getTasksForProjectsAction(projectIds);

        // Map tasks with a dueDate to EventItems; skip completed tasks using the
        // canonical isTaskCompleted() helper from lib/project-stats.ts.
        const taskEvents: EventItem[] = allTasks
          .filter((t) => t.dueDate && !isTaskCompleted(t.status))
          .map((t) => {
            const d = new Date(t.dueDate!);
            return {
              id: `task-dl-${t.id}`,
              title: t.title,
              description: t.description || undefined,
              type: "Task",
              date: !isNaN(d.getTime())
                ? d.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "",
              rawDate: !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "",
              priority: (t.priority as "High" | "Medium" | "Low") || "Medium",
              projectName: t.projectName,
              completed: false,
              createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
            };
          });

        if (taskEvents.length > 0) {
          setEvents((prev) => {
            const merged = new Map(prev.map((e) => [e.id, e]));
            // Task events don't override existing stored custom events.
            for (const t of taskEvents) {
              if (!merged.has(t.id)) merged.set(t.id, t);
            }
            return Array.from(merged.values());
          });
        }
      })
      .catch(() => {});
  }, [storageKey]);

  const persistEvents = (updated: EventItem[]) => {
    // Only persist custom events to localStorage (exclude DB task items)
    const customOnly = updated.filter((e) => !e.id.startsWith("task-dl-"));
    saveCleanEvents(storageKey, customOnly);
    setEvents(updated);
  };

  const handleToggleComplete = (id: string) =>
    persistEvents(events.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)));
  const handleDelete = (id: string) => {
    setPendingAction({ type: "delete", id });
    setConfirmVariant("delete");
    setConfirmTitle("Delete this event?");
    setConfirmDesc("This will permanently remove the event. This action cannot be undone.");
    setConfirmOpen(true);
  };
  const handleArchive = (id: string) => {
    setPendingAction({ type: "archive", id });
    setConfirmVariant("delete");
    setConfirmTitle("Archive this event?");
    setConfirmDesc("Are you sure you want to archive this event?");
    setConfirmOpen(true);
  };
  const executePendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "delete")
      persistEvents(events.filter((e) => e.id !== pendingAction.id));
    else
      persistEvents(events.map((e) => (e.id === pendingAction.id ? { ...e, archived: true } : e)));
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const today = new Date();
  const eventDates = useMemo(() => {
    const set = new Set<number>();
    events
      .filter((e) => !e.archived)
      .forEach((e) => {
        const [y, m, d] = e.rawDate.split("-").map(Number);
        if (y === currentYear && m === currentMonthIndex + 1) set.add(d);
      });
    return set;
  }, [events, currentYear, currentMonthIndex]);

  const activeEvents = useMemo(() => events.filter((e) => !e.archived), [events]);
  const archivedEvents = useMemo(() => events.filter((e) => e.archived), [events]);
  const draftEvents = useMemo(() => activeEvents.filter((e) => e.isDraft), [activeEvents]);
  // Recent Activity: most-recently-created active (non-archived) events, up to 5.
  // Derived entirely from the events state — no hardcoded stand-in.
  // Will be empty for users with no events, which is the correct behavior.
  const recentActivity = useMemo(
    () =>
      [...activeEvents]
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 5),
    [activeEvents],
  );
  const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

  const filteredEvents = useMemo(() => {
    let list = activeEvents.filter((e) => !e.isDraft);
    if (selectedDay) {
      const ds = selectedDay < 10 ? `0${selectedDay}` : `${selectedDay}`;
      const ms =
        currentMonthIndex + 1 < 10 ? `0${currentMonthIndex + 1}` : `${currentMonthIndex + 1}`;
      list = list.filter((e) => e.rawDate === `${currentYear}-${ms}-${ds}`);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          (e.projectName || "").toLowerCase().includes(q),
      );
    }
    if (filterStatus === "Completed") list = list.filter((e) => e.completed);
    if (filterStatus === "Active") list = list.filter((e) => !e.completed);
    if (filterPriority !== "All") list = list.filter((e) => e.priority === filterPriority);
    if (filterCategory !== "All") list = list.filter((e) => e.type === filterCategory);
    return [...list].sort((a, b) => {
      if (sortBy === "date-asc") return a.rawDate.localeCompare(b.rawDate);
      if (sortBy === "date-desc") return b.rawDate.localeCompare(a.rawDate);
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "priority")
        return (
          (priorityOrder[a.priority || "Low"] ?? 2) - (priorityOrder[b.priority || "Low"] ?? 2)
        );
      return 0;
    });
  }, [
    activeEvents,
    search,
    filterStatus,
    filterPriority,
    filterCategory,
    sortBy,
    selectedDay,
    currentYear,
    currentMonthIndex,
  ]);

  const statsCards = [
    {
      label: "Total Events",
      value: activeEvents.length + draftEvents.length,
      accentColor: "#0033a0",
      color: "text-[#0033a0] dark:text-blue-400",
      pillBg: "bg-blue-50 text-[#0033a0] dark:bg-blue-950/60 dark:text-blue-400",
      icon: CalendarDays,
    },
    {
      label: "Upcoming",
      value: activeEvents.filter((e) => !e.completed).length,
      accentColor: "#10b981",
      color: "text-emerald-600 dark:text-emerald-400",
      pillBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
      icon: Clock,
    },
    {
      label: "Drafts",
      value: draftEvents.length,
      accentColor: "#f59e0b",
      color: "text-amber-600 dark:text-amber-400",
      pillBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
      icon: FileEdit,
    },
    {
      label: "Archived",
      value: archivedEvents.length,
      accentColor: "#64748b",
      color: "text-slate-600 dark:text-slate-400",
      pillBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      icon: Archive,
    },
  ];

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <div className="space-y-5 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#142843] dark:text-white tracking-tight">
              Calendar
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Track deadlines, meetings, and milestones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/calendar/new")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0033a0] hover:bg-[#00277a] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" /> Add Event
            </button>
          </div>
        </div>

        {/* Stat Cards — shared StatCard component, same styling as Calendar & Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {statsCards.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              accentColor={s.accentColor}
              color={s.color}
              pillBg={s.pillBg}
            />
          ))}
        </div>

        {/* Main 2-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Events List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search + Filter Toolbar */}
            <div className="bg-white dark:bg-[#1c304a] rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search deadlines, events..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm font-medium text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc] placeholder:text-slate-400"
                  />
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800/50 text-xs font-bold text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc] cursor-pointer"
                  >
                    <option value="All">Status</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <Filter
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800/50 text-xs font-bold text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc] cursor-pointer"
                  >
                    <option value="date-asc">Sort by: Date ↑</option>
                    <option value="date-desc">Sort by: Date ↓</option>
                    <option value="name-asc">Sort by: Name</option>
                    <option value="priority">Sort by: Priority</option>
                  </select>
                  <SlidersHorizontal
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800/50 text-xs font-bold text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc] cursor-pointer"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <Flame
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800/50 text-xs font-bold text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc] cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {(eventCategoryNames && eventCategoryNames.length > 0
                      ? eventCategoryNames
                      : ["Project Deadline", "Meeting", "Milestone", "Presentation", "Task"]
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <Layers
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
              {selectedDay && (
                <SelectedDayChip
                  selectedDay={selectedDay}
                  currentMonthIndex={currentMonthIndex}
                  currentYear={currentYear}
                  onClear={() => setSelectedDay(null)}
                />
              )}
            </div>

            <EventsList
              filteredEvents={filteredEvents}
              draftEvents={draftEvents}
              onToggleComplete={handleToggleComplete}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          </div>

          {/* Right Column: Calendar + Recent Activity */}
          <div className="lg:col-span-4 space-y-4">
            <CalendarGrid
              currentYear={currentYear}
              currentMonthIndex={currentMonthIndex}
              selectedDay={selectedDay}
              eventDates={eventDates}
              onSelectDay={setSelectedDay}
              onPrevMonth={() => {
                if (currentMonthIndex === 0) {
                  setCurrentMonthIndex(11);
                  setCurrentYear((y) => y - 1);
                } else setCurrentMonthIndex((m) => m - 1);
                setSelectedDay(null);
              }}
              onNextMonth={() => {
                if (currentMonthIndex === 11) {
                  setCurrentMonthIndex(0);
                  setCurrentYear((y) => y + 1);
                } else setCurrentMonthIndex((m) => m + 1);
                setSelectedDay(null);
              }}
              onGoToToday={() => {
                setCurrentYear(today.getFullYear());
                setCurrentMonthIndex(today.getMonth());
                setSelectedDay(today.getDate());
              }}
            />

            {/* Recent Activity — derived from events state, empty for new users */}
            <div className="bg-white dark:bg-[#1c304a] rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-extrabold text-[#142843] dark:text-white mb-3">
                Recent Activity
              </h3>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent events.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((e) => (
                    <div key={e.id} className="flex items-start gap-2.5">
                      <div className="mt-1 w-2 h-2 rounded-full bg-[#0052cc] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#142843] dark:text-white truncate">
                          {e.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {e.type} · {e.date}
                        </p>
                      </div>
                      <span
                        className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge(e.priority)}`}
                      >
                        {e.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {archivedEvents.length > 0 && (
              <div
                className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                onClick={() => router.push("/calendar/events?tab=archived")}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Archive size={15} className="text-slate-500" />
                  <h3 className="text-sm font-extrabold text-slate-600 dark:text-slate-300">
                    Archived Events
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {archivedEvents.length} event{archivedEvents.length > 1 ? "s" : ""} archived.
                  Click to manage →
                </p>
              </div>
            )}
          </div>
        </div>

        <ConfirmationModal
          isOpen={confirmOpen}
          onClose={() => {
            setConfirmOpen(false);
            setPendingAction(null);
          }}
          onConfirm={executePendingAction}
          variant={confirmVariant}
          title={confirmTitle}
          description={confirmDesc}
          confirmLabel={pendingAction?.type === "archive" ? "Archive" : "Delete"}
          showCloseButton={false}
        />
      </div>
    </div>
  );
}
