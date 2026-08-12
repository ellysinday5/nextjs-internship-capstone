"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Trash2,
  Clock,
  Archive,
  FileEdit,
  CalendarDays,
  Flame,
  Filter,
  SlidersHorizontal,
  Layers,
  ChevronDown,
} from "lucide-react";
import { getProjectsAction } from "@/actions/project-actions";
import { getProjectTasksAction } from "@/actions/task-actions";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

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

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function priorityBadge(p?: string) {
  if (p === "High") return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
  if (p === "Medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

function typeBadge(t: string) {
  const m: Record<string, string> = {
    "Project Deadline": "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    "Meeting": "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    "Milestone": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    "Presentation": "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
    "Task": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  };
  return m[t] || "bg-slate-100 text-slate-600";
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

  // Confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<"delete" | "logout" | "save" | "discard">("delete");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const [pendingAction, setPendingAction] = useState<{ type: "archive" | "delete"; id: string } | null>(null);

  // Load custom events
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: EventItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const fresh = parsed.filter((item) => !existingIds.has(item.id));
            return [...fresh, ...prev];
          });
        }
      }
    } catch {}

    getProjectsAction()
      .then(async (projectsList) => {
        if (!Array.isArray(projectsList)) return;
        const taskPromises = projectsList.map(async (p) => {
          try {
            const tasks = await getProjectTasksAction(p.id);
            return tasks
              .filter((t) => t.dueDate)
              .map((t) => {
                const d = new Date(t.dueDate!);
                const dateStr = !isNaN(d.getTime())
                  ? d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "";
                const isoStr = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
                return {
                  id: `task-dl-${t.id}`,
                  title: t.title,
                  description: t.description || undefined,
                  type: "Task",
                  date: dateStr,
                  rawDate: isoStr,
                  priority: (t.priority as any) || "Medium",
                  projectName: p.name,
                  completed: t.status === "Completed" || t.status === "Complete",
                  createdAt: new Date().toISOString(),
                } as EventItem;
              });
          } catch {
            return [];
          }
        });
        const all = (await Promise.all(taskPromises)).flat();
        if (all.length > 0) {
          setEvents((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            return [...prev, ...all.filter((t) => !existingIds.has(t.id))];
          });
        }
      })
      .catch(() => {});
  }, []);

  const persistEvents = (updated: EventItem[]) => {
    setEvents(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const handleToggleComplete = (id: string) => {
    persistEvents(events.map((e) => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const handleDelete = (id: string) => {
    setPendingAction({ type: "delete", id });
    setConfirmVariant("delete");
    setConfirmTitle("Delete this event?");
    setConfirmDesc("This will permanently remove the event from your calendar. This action cannot be undone.");
    setConfirmOpen(true);
  };

  const handleArchive = (id: string) => {
    setPendingAction({ type: "archive", id });
    setConfirmVariant("delete"); // use delete variant styling (red button) or reuse confirmation modal
    setConfirmTitle("Archive this event?");
    setConfirmDesc("Are you sure you want to archive this event? You can manage archived events from the Manage Events page.");
    setConfirmOpen(true);
  };

  const executePendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "delete") {
      persistEvents(events.filter((e) => e.id !== pendingAction.id));
    } else if (pendingAction.type === "archive") {
      persistEvents(events.map((e) => e.id === pendingAction.id ? { ...e, archived: true } : e));
    }
    setConfirmOpen(false);
    setPendingAction(null);
  };

  // Calendar helpers
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonthIndex;

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) { setCurrentMonthIndex(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonthIndex((m) => m - 1);
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    if (currentMonthIndex === 11) { setCurrentMonthIndex(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonthIndex((m) => m + 1);
    setSelectedDay(null);
  };

  // Dates with events
  const eventDates = useMemo(() => {
    const set = new Set<number>();
    events.filter((e) => !e.archived).forEach((e) => {
      const [y, m, d] = e.rawDate.split("-").map(Number);
      if (y === currentYear && m === currentMonthIndex + 1) set.add(d);
    });
    return set;
  }, [events, currentYear, currentMonthIndex]);

  // Active (non-archived) events
  const activeEvents = useMemo(() => events.filter((e) => !e.archived), [events]);
  const archivedEvents = useMemo(() => events.filter((e) => e.archived), [events]);
  const draftEvents = useMemo(() => activeEvents.filter((e) => e.isDraft), [activeEvents]);
  const recentActivity = useMemo(
    () => [...activeEvents].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 5),
    [activeEvents]
  );

  const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

  const filteredEvents = useMemo(() => {
    let list = activeEvents.filter((e) => !e.isDraft);

    if (selectedDay) {
      const ds = selectedDay < 10 ? `0${selectedDay}` : `${selectedDay}`;
      const ms = currentMonthIndex + 1 < 10 ? `0${currentMonthIndex + 1}` : `${currentMonthIndex + 1}`;
      list = list.filter((e) => e.rawDate === `${currentYear}-${ms}-${ds}`);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || (e.projectName || "").toLowerCase().includes(q)
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
      if (sortBy === "priority") return (priorityOrder[a.priority || "Low"] ?? 2) - (priorityOrder[b.priority || "Low"] ?? 2);
      return 0;
    });
  }, [activeEvents, search, filterStatus, filterPriority, filterCategory, sortBy, selectedDay, currentYear, currentMonthIndex]);

  const statsCards = [
    { label: "Total Events", value: activeEvents.length, color: "text-[#0052cc]", bg: "bg-blue-50 dark:bg-blue-950/30", icon: CalendarDays },
    { label: "Upcoming", value: activeEvents.filter((e) => !e.completed).length, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30", icon: Clock },
    { label: "Drafts", value: draftEvents.length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", icon: FileEdit },
    { label: "Archived", value: archivedEvents.length, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800/50", icon: Archive },
  ];

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
    <div className="space-y-5 w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142843] dark:text-white tracking-tight">Calendar</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Track deadlines, meetings, and milestones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/calendar/events")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 text-[#142843] dark:text-white font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-xs"
          >
            <Layers size={15} className="text-[#0052cc]" />
            Manage Events
          </button>
          <button
            onClick={() => router.push("/calendar/new")}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Plus size={16} className="stroke-[3]" />
            Add Event
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3 border border-transparent dark:border-slate-800`}>
            <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900/50 shadow-xs`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 2-column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ──── Left Column: Events List ──── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search + Filter Toolbar */}
          <div className="bg-white dark:bg-[#1c304a] rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search deadlines, events..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm font-medium text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc] placeholder:text-slate-400"
                />
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Status */}
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
                <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Sort */}
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
                <SlidersHorizontal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Priority */}
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
                <Flame size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Category */}
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
                <Layers size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {selectedDay && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0052cc]">
                <CalendarDays size={13} />
                Showing events on {monthNames[currentMonthIndex]} {selectedDay}, {currentYear}
                <button onClick={() => setSelectedDay(null)} className="ml-1 underline text-slate-400 hover:text-slate-600">Clear</button>
              </div>
            )}
          </div>

          {/* Events List */}
          <div className="bg-white dark:bg-[#1c304a] rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-extrabold text-[#142843] dark:text-white">
                Upcoming Deadlines & Events
                <span className="ml-2 text-xs font-semibold text-slate-400">({filteredEvents.length})</span>
              </h2>
              <button
                onClick={() => router.push("/calendar/events")}
                className="text-xs font-bold text-[#0052cc] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEvents.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <CalendarDays size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">No events found.</p>
                  <p className="text-xs mt-1">Try adjusting your filters or add a new event.</p>
                </div>
              ) : (
                filteredEvents.slice(0, 8).map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 px-5 py-4 group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${event.completed ? "opacity-55" : ""}`}
                  >
                    {/* Complete toggle */}
                    <button
                      onClick={() => handleToggleComplete(event.id)}
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        event.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 dark:border-slate-600 hover:border-emerald-400"
                      }`}
                    >
                      {event.completed && <CheckCircle2 size={12} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`text-sm font-extrabold text-[#142843] dark:text-white ${event.completed ? "line-through opacity-60" : ""}`}>
                          {event.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge(event.type)}`}>{event.type}</span>
                        {event.priority && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge(event.priority)}`}>{event.priority} Priority</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {event.date}{event.time ? ` · ${event.time}` : ""} · {event.projectName || "General"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleArchive(event.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                        title="Archive"
                      >
                        <Archive size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredEvents.length > 8 && (
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => router.push("/calendar/events")}
                  className="text-xs font-bold text-[#0052cc] hover:underline"
                >
                  View all {filteredEvents.length} events →
                </button>
              </div>
            )}
          </div>

          {/* Draft Events Card */}
          {draftEvents.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileEdit size={16} className="text-amber-600" />
                  <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300">Draft Events</h3>
                  <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-[10px] font-bold rounded-full">{draftEvents.length}</span>
                </div>
                <button
                  onClick={() => router.push("/calendar/events?tab=drafts")}
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Manage Drafts
                </button>
              </div>
              <div className="space-y-2">
                {draftEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 cursor-pointer hover:border-amber-400 transition-colors"
                    onClick={() => router.push("/calendar/new?draft=" + e.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileEdit size={13} className="text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-[#142843] dark:text-white truncate">{e.title || "Untitled Draft"}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 shrink-0">Continue editing →</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ──── Right Column: Calendar + Recent Activity ──── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Mini Calendar */}
          <div className="bg-white dark:bg-[#1c304a] rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-extrabold text-[#142843] dark:text-white">
                {monthNames[currentMonthIndex]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {dayLabels.map((d) => (
                <div key={d} className="text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = isCurrentMonth && today.getDate() === day;
                const isSelected = selectedDay === day;
                const hasEvent = eventDates.has(day);
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`relative flex flex-col items-center justify-center h-9 rounded-xl text-xs font-bold transition-all
                      ${isSelected ? "bg-[#0052cc] text-white shadow-sm" : isToday ? "bg-blue-50 dark:bg-blue-950/40 text-[#0052cc]" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"}`}
                  >
                    {day}
                    {hasEvent && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0052cc]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Today button */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => { setCurrentYear(today.getFullYear()); setCurrentMonthIndex(today.getMonth()); setSelectedDay(today.getDate()); }}
                className="text-xs font-bold text-[#0052cc] hover:underline"
              >
                Go to Today
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#1c304a] rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#142843] dark:text-white">Recent Activity</h3>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent events.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((e) => (
                  <div key={e.id} className="flex items-start gap-2.5">
                    <div className="mt-1 w-2 h-2 rounded-full bg-[#0052cc] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#142843] dark:text-white truncate">{e.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{e.type} · {e.date}</p>
                    </div>
                    <span className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge(e.priority)}`}>{e.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archive Summary */}
          {archivedEvents.length > 0 && (
            <div
              className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              onClick={() => router.push("/calendar/events?tab=archived")}
            >
              <div className="flex items-center gap-2 mb-1">
                <Archive size={15} className="text-slate-500" />
                <h3 className="text-sm font-extrabold text-slate-600 dark:text-slate-300">Archived Events</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {archivedEvents.length} event{archivedEvents.length > 1 ? "s" : ""} archived. Click to manage →
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingAction(null); }}
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
