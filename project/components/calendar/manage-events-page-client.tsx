"use client";

import { type ProjectWithStats, getProjectsAction } from "@/actions/project-actions";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { BackButton } from "@/components/ui/back-button";
import {
  type CalendarEventItem,
  getCalendarStorageKey,
  loadCleanEvents,
  saveCleanEvents,
} from "@/lib/calendar-storage";
import { useUser } from "@clerk/nextjs";
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileEdit,
  Filter,
  Flame,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";

type EventItem = CalendarEventItem;

function priorityBadge(p?: string) {
  if (p === "High")
    return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
  if (p === "Medium")
    return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

function typeBadge(t: string) {
  const m: Record<string, string> = {
    "Project Deadline": "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    Meeting: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    Milestone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    Presentation: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
    Task: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  };
  return m[t] || "bg-slate-100 text-slate-600";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type TabKey = "active" | "drafts" | "archived";

export function ManageEventsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const storageKey = getCalendarStorageKey(user?.id);

  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "active",
  );

  const [events, setEvents] = useState<EventItem[]>([]);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "name-asc" | "priority">(
    "date-asc",
  );

  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPriority, setEditPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editLocation, setEditLocation] = useState("");
  const [editProjectId, setEditProjectId] = useState("general");
  const [editDirty, setEditDirty] = useState(false);
  const [editInvitees, setEditInvitees] = useState<string[]>([]);
  const [editInviteeInput, setEditInviteeInput] = useState("");
  const [editRecurringDays, setEditRecurringDays] = useState<number[]>([]);

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
    const stored = loadCleanEvents(storageKey);
    setEvents(stored);

    getProjectsAction()
      .then((res) => {
        if (Array.isArray(res)) setProjects(res);
      })
      .catch(() => {});
  }, [storageKey]);

  const persistEvents = (updated: EventItem[]) => {
    saveCleanEvents(storageKey, updated);
    setEvents(updated);
  };

  const handleToggleComplete = (id: string) => {
    persistEvents(events.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)));
  };

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
    setConfirmDesc(
      "Are you sure you want to archive this event? You can find archived events in the Archived tab.",
    );
    setConfirmOpen(true);
  };

  const executePendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "delete") {
      persistEvents(events.filter((e) => e.id !== pendingAction.id));
      if (editingEvent?.id === pendingAction.id) setEditingEvent(null);
    } else if (pendingAction.type === "archive") {
      persistEvents(
        events.map((e) =>
          e.id === pendingAction.id ? { ...e, archived: true, isDraft: false } : e,
        ),
      );
      if (editingEvent?.id === pendingAction.id) setEditingEvent(null);
    }
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleUnarchive = (id: string) => {
    persistEvents(events.map((e) => (e.id === id ? { ...e, archived: false } : e)));
  };

  const handlePublishDraft = (id: string) => {
    persistEvents(events.map((e) => (e.id === id ? { ...e, isDraft: false } : e)));
  };

  const openEdit = (event: EventItem) => {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditDescription(event.description || "");
    setEditCategory(event.type);
    setEditDate(event.rawDate);
    setEditTime(event.time || "09:00");
    setEditPriority(event.priority || "Medium");
    setEditLocation(event.locationLink || "");
    const proj = projects.find((p) => p.name === event.projectName);
    setEditProjectId(proj?.id || "general");
    setEditInvitees(event.invitees || []);
    setEditRecurringDays(event.recurringDays || []);
    setEditInviteeInput("");
    setEditDirty(false);
  };

  const handleSaveEdit = (publishNow = false) => {
    if (!editingEvent || !editTitle.trim()) return;
    const parsedDate = new Date(editDate);
    const dateFormatted = !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : editDate || "TBD";
    const projectName =
      editProjectId === "general"
        ? "General Workspace"
        : projects.find((p) => p.id === editProjectId)?.name || "Project";
    const isUnfinished = !editDate || !editTitle.trim();
    const shouldBeDraft = !publishNow && (isUnfinished || editingEvent.isDraft);
    persistEvents(
      events.map((e) =>
        e.id === editingEvent.id
          ? {
              ...e,
              title: editTitle.trim(),
              description: editDescription.trim(),
              type: editCategory,
              date: dateFormatted,
              rawDate: editDate,
              time: editTime,
              priority: editPriority,
              locationLink: editLocation.trim(),
              projectName,
              isDraft: shouldBeDraft,
              ...(editCategory === "Meeting" && {
                invitees: editInvitees,
                recurringDays: editRecurringDays,
              }),
            }
          : e,
      ),
    );
    setEditingEvent(null);
    setEditDirty(false);
  };

  const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

  const applyFiltersSort = (list: EventItem[]) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.projectName || "").toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q),
      );
    }
    if (filterCategory !== "All") list = list.filter((e) => e.type === filterCategory);
    if (filterPriority !== "All") list = list.filter((e) => e.priority === filterPriority);
    if (filterStatus === "Completed") list = list.filter((e) => e.completed);
    if (filterStatus === "Active") list = list.filter((e) => !e.completed);
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
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeEvents = useMemo(
    () => applyFiltersSort(events.filter((e) => !e.archived && !e.isDraft)),
    [events, search, filterCategory, filterPriority, filterStatus, sortBy],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const draftEvents = useMemo(
    () => applyFiltersSort(events.filter((e) => e.isDraft && !e.archived)),
    [events, search, filterCategory, filterPriority, filterStatus, sortBy],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const archivedEvents = useMemo(
    () => applyFiltersSort(events.filter((e) => e.archived)),
    [events, search, filterCategory, filterPriority, filterStatus, sortBy],
  );

  const tabData = [
    { key: "active" as TabKey, label: "Active", count: activeEvents.length, icon: CalendarDays },
    { key: "drafts" as TabKey, label: "Drafts", count: draftEvents.length, icon: FileEdit },
    { key: "archived" as TabKey, label: "Archived", count: archivedEvents.length, icon: Archive },
  ];

  const currentList =
    activeTab === "active" ? activeEvents : activeTab === "drafts" ? draftEvents : archivedEvents;

  const inputCls =
    "w-full px-3 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white text-sm font-medium focus:outline-none focus:border-[#0052cc]";

  return (
    <div className="overflow-y-auto h-full">
      <div className="w-full bg-white dark:bg-slate-950 flex flex-col">
        {/* Top Nav */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <BackButton onClick={() => router.push("/calendar")} title="Back to Calendar" />
          <button
            onClick={() => router.push("/calendar/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} />
            New Event
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left: List Panel */}
          <div
            className={`flex flex-col min-h-0 transition-all duration-300 ${editingEvent ? "w-1/2 border-r border-slate-100 dark:border-slate-800" : "w-full"}`}
          >
            <div className="px-6 pt-5 pb-0 shrink-0">
              <h1 className="text-xl font-black text-[#142843] dark:text-white mb-4">
                Manage Events
              </h1>
              <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800">
                {tabData.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setEditingEvent(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold rounded-t-lg border-b-2 transition-all -mb-px ${
                      activeTab === tab.key
                        ? "border-[#0052cc] text-[#0052cc] bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#142843] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === tab.key
                          ? "bg-[#0052cc] text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[160px]">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events..."
                    className="w-full pl-8 pr-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#0f1d31] text-xs font-medium text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc]"
                  />
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="appearance-none pl-7 pr-6 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc]"
                  >
                    <option value="All">Category</option>
                    <option value="Project Deadline">Project Deadline</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Task">Task</option>
                  </select>
                  <Layers
                    size={12}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <ChevronDown
                    size={10}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="appearance-none pl-7 pr-6 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc]"
                  >
                    <option value="All">Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <Flame
                    size={12}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <ChevronDown
                    size={10}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
                {activeTab === "active" && (
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="appearance-none pl-7 pr-6 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc]"
                    >
                      <option value="All">Status</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <Filter
                      size={12}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <ChevronDown
                      size={10}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                )}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="appearance-none pl-7 pr-6 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc]"
                  >
                    <option value="date-asc">Date ↑</option>
                    <option value="date-desc">Date ↓</option>
                    <option value="name-asc">Name A–Z</option>
                    <option value="priority">Priority</option>
                  </select>
                  <SlidersHorizontal
                    size={12}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <ChevronDown
                    size={10}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
              {currentList.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  {activeTab === "archived" ? (
                    <Archive size={32} className="mx-auto mb-2 text-slate-300" />
                  ) : activeTab === "drafts" ? (
                    <FileEdit size={32} className="mx-auto mb-2 text-slate-300" />
                  ) : (
                    <CalendarDays size={32} className="mx-auto mb-2 text-slate-300" />
                  )}
                  <p className="text-sm font-semibold">
                    {activeTab === "archived"
                      ? "No archived events."
                      : activeTab === "drafts"
                        ? "No draft events."
                        : "No events found."}
                  </p>
                  {activeTab === "active" && (
                    <button
                      onClick={() => router.push("/calendar/new")}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Create your first event
                    </button>
                  )}
                </div>
              ) : (
                currentList.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3 group cursor-pointer ${
                      editingEvent?.id === event.id
                        ? "border-[#0052cc] bg-blue-50/50 dark:bg-blue-950/20"
                        : event.archived
                          ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-70"
                          : event.isDraft
                            ? "border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/10"
                            : event.completed
                              ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] opacity-55"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] hover:border-[#0052cc]/40 hover:shadow-sm"
                    }`}
                    onClick={() => openEdit(event)}
                  >
                    {activeTab === "active" && (
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleToggleComplete(event.id);
                        }}
                        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${event.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 hover:border-emerald-400"}`}
                      >
                        {event.completed && <CheckCircle2 size={11} />}
                      </button>
                    )}
                    {activeTab === "drafts" && (
                      <FileEdit size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    )}
                    {activeTab === "archived" && (
                      <Archive size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className={`text-sm font-extrabold text-[#142843] dark:text-white truncate ${event.completed ? "line-through opacity-60" : ""}`}
                        >
                          {event.title || "Untitled Draft"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge(event.type)}`}
                        >
                          {event.type}
                        </span>
                        {event.priority && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge(event.priority)}`}
                          >
                            {event.priority}
                          </span>
                        )}
                        {event.isDraft && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {event.date || "No date set"}
                        {event.time ? ` · ${event.time}` : ""} · {event.projectName || "General"}
                      </p>
                      {event.type === "Meeting" &&
                        event.recurringDays &&
                        event.recurringDays.length > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Repeats:{" "}
                            {event.recurringDays
                              .sort((a, b) => a - b)
                              .map((d) => DAY_LABELS[d])
                              .join(", ")}
                          </p>
                        )}
                      {event.type === "Meeting" && event.invitees && event.invitees.length > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Users size={11} /> {event.invitees.length}{" "}
                          {event.invitees.length === 1 ? "invitee" : "invitees"}
                        </p>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      {activeTab === "drafts" && (
                        <button
                          onClick={() => handlePublishDraft(event.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                          title="Publish Draft"
                        >
                          <CheckCircle2 size={13} />
                        </button>
                      )}
                      {activeTab === "archived" ? (
                        <button
                          onClick={() => handleUnarchive(event.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0052cc] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Restore"
                        >
                          <ArchiveRestore size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchive(event.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                          title="Archive"
                        >
                          <Archive size={13} />
                        </button>
                      )}
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
          </div>

          {/* Right: Edit Panel */}
          {editingEvent && (
            <div className="w-1/2 flex flex-col min-h-0 bg-slate-50/60 dark:bg-[#0f1d31]/60">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-[#142843] dark:text-white">
                    {editingEvent.isDraft ? "Finish Draft" : "Edit Event"}
                  </h2>
                  {editDirty && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200">
                      Unsaved
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value);
                      setEditDirty(true);
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => {
                      setEditDescription(e.target.value);
                      setEditDirty(true);
                    }}
                    className={`${inputCls} resize-y`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => {
                        setEditCategory(e.target.value);
                        setEditDirty(true);
                      }}
                      className={inputCls}
                    >
                      <option value="Project Deadline">Project Deadline</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Milestone">Milestone</option>
                      <option value="Presentation">Presentation</option>
                      <option value="Task">Task</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => {
                        setEditPriority(e.target.value as "High" | "Medium" | "Low");
                        setEditDirty(true);
                      }}
                      className={inputCls}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => {
                        setEditDate(e.target.value);
                        setEditDirty(true);
                      }}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Time
                    </label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => {
                        setEditTime(e.target.value);
                        setEditDirty(true);
                      }}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Project
                  </label>
                  <select
                    value={editProjectId}
                    onChange={(e) => {
                      setEditProjectId(e.target.value);
                      setEditDirty(true);
                    }}
                    className={inputCls}
                  >
                    <option value="general">General Workspace</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Location / Link
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => {
                      setEditLocation(e.target.value);
                      setEditDirty(true);
                    }}
                    placeholder="Google Meet, Room 402..."
                    className={inputCls}
                  />
                </div>

                {editCategory === "Meeting" && (
                  <>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-wider mb-3">
                        Meeting Options
                      </p>
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          Recurring Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DAY_LABELS.map((day, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setEditDirty(true);
                                setEditRecurringDays((prev) =>
                                  prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i],
                                );
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                editRecurringDays.includes(i)
                                  ? "bg-[#0052cc] text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          Invite People
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={editInviteeInput}
                            onChange={(e) => setEditInviteeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editInviteeInput.trim()) {
                                e.preventDefault();
                                if (!editInvitees.includes(editInviteeInput.trim())) {
                                  setEditInvitees((prev) => [...prev, editInviteeInput.trim()]);
                                  setEditDirty(true);
                                }
                                setEditInviteeInput("");
                              }
                            }}
                            placeholder="Name or email, press Enter to add"
                            className="flex-1 px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white text-xs font-medium focus:outline-none focus:border-[#0052cc]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                editInviteeInput.trim() &&
                                !editInvitees.includes(editInviteeInput.trim())
                              ) {
                                setEditInvitees((prev) => [...prev, editInviteeInput.trim()]);
                                setEditDirty(true);
                              }
                              setEditInviteeInput("");
                            }}
                            className="px-3 py-2 bg-[#0052cc] hover:bg-[#003d99] text-white text-xs font-bold rounded-xl transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {editInvitees.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {editInvitees.map((inv) => (
                              <span
                                key={inv}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 text-[#0052cc] dark:text-sky-400 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800"
                              >
                                {inv}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditInvitees((prev) => prev.filter((i) => i !== inv));
                                    setEditDirty(true);
                                  }}
                                  className="text-blue-400 hover:text-red-500 transition-colors"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {editingEvent.isDraft && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                      This is a draft. Fill in all required fields and click <strong>Save</strong>{" "}
                      to make it active.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(editingEvent.id)}
                  className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-700 text-xs font-semibold transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setEditDirty(false);
                    }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  {editingEvent.isDraft && (
                    <button
                      onClick={() => handleSaveEdit(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={13} /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleSaveEdit(true)}
                    className="bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
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
