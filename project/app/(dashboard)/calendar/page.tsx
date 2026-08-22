"use client";

import { getProjectsAction } from "@/actions/project-actions";
import { getProjectTasksAction } from "@/actions/task-actions";
import { CalendarGrid, SelectedDayChip } from "@/components/calendar/calendar-grid";
import { EventsList } from "@/components/calendar/events-list";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
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

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  date: string;
  rawDate: string;
  time?: string;
  priority?: "High" | "Medium" | "Low";
  projectName?: string;
  locationLink?: string;
  completed?: boolean;
  archived?: boolean;
  isDraft?: boolean;
  createdAt?: string;
}

const STORAGE_KEY = "syntraflow_custom_events";

const initialDeadlines: EventItem[] = [
  {
    id: "dl-1",
    title: "Website Redesign",
    type: "Project Deadline",
    date: "July 25, 2026",
    rawDate: "2026-07-25",
    priority: "High",
    projectName: "Ellen's first project",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dl-2",
    title: "Team Sync Meeting",
    type: "Meeting",
    date: "July 26, 2026",
    rawDate: "2026-07-26",
    priority: "Medium",
    projectName: "General",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dl-3",
    title: "Mobile App Launch",
    type: "Milestone",
    date: "July 27, 2026",
    rawDate: "2026-07-27",
    priority: "High",
    projectName: "SyntraFlow Platform",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dl-4",
    title: "Capstone Presentation",
    type: "Presentation",
    date: "July 28, 2026",
    rawDate: "2026-07-28",
    priority: "High",
    projectName: "Internship Milestone",
    createdAt: new Date().toISOString(),
  },
];

function priorityBadge(p?: string) {
  if (p === "High")
    return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
  if (p === "Medium")
    return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(initialDeadlines);
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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: EventItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents((prev) => {
            const ids = new Set(prev.map((d) => d.id));
            return [...parsed.filter((i) => !ids.has(i.id)), ...prev];
          });
        }
      }
    } catch {}
    getProjectsAction()
      .then(async (projectsList) => {
        if (!Array.isArray(projectsList)) return;
        const all = (
          await Promise.all(
            projectsList.map(async (p) => {
              try {
                const tasks = await getProjectTasksAction(p.id);
                return tasks
                  .filter((t) => t.dueDate)
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
                      priority: (t.priority as any) || "Medium",
                      projectName: p.name,
                      completed: t.status === "Completed" || t.status === "Complete",
                      createdAt: new Date().toISOString(),
                    } as EventItem;
                  });
              } catch {
                return [];
              }
            }),
          )
        ).flat();
        if (all.length > 0)
          setEvents((prev) => {
            const ids = new Set(prev.map((d) => d.id));
            return [...prev, ...all.filter((t) => !ids.has(t.id))];
          });
      })
      .catch(() => {});
  }, []);

  const persistEvents = (updated: EventItem[]) => {
    setEvents(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
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
      value: activeEvents.length,
      color: "text-[#0052cc]",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      icon: CalendarDays,
    },
    {
      label: "Upcoming",
      value: activeEvents.filter((e) => !e.completed).length,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      icon: Clock,
    },
    {
      label: "Drafts",
      value: draftEvents.length,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      icon: FileEdit,
    },
    {
      label: "Archived",
      value: archivedEvents.length,
      color: "text-slate-500",
      bg: "bg-slate-100 dark:bg-slate-800/50",
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
              onClick={() => router.push("/calendar/events")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 text-[#142843] dark:text-white font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-xs"
            >
              <Layers size={15} className="text-[#0052cc]" /> Manage Events
            </button>
            <button
              onClick={() => router.push("/calendar/new")}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <Plus size={16} className="stroke-[3]" /> Add Event
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statsCards.map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl p-4 flex items-center gap-3 border border-transparent dark:border-slate-800`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 shadow-xs">
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {s.label}
                </p>
              </div>
            </div>
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
                    <option value="All">Categories</option>
                    <option value="Project Deadline">Project Deadline</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Task">Task</option>
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

            {/* Recent Activity */}
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
