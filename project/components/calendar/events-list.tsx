"use client";

import type { EventItem } from "@/app/(dashboard)/calendar/page";
import { Archive, CalendarDays, CheckCircle2, FileEdit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface EventsListProps {
  filteredEvents: EventItem[];
  draftEvents: EventItem[];
  onToggleComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EventsList({
  filteredEvents,
  draftEvents,
  onToggleComplete,
  onArchive,
  onDelete,
}: EventsListProps) {
  const router = useRouter();

  return (
    <>
      {/* Events List */}
      <div className="bg-white dark:bg-[#1c304a] rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-[#142843] dark:text-white">
            Upcoming Deadlines &amp; Events
            <span className="ml-2 text-xs font-semibold text-slate-400">
              ({filteredEvents.length})
            </span>
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
                <button
                  onClick={() => onToggleComplete(event.id)}
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
                    <span
                      className={`text-sm font-extrabold text-[#142843] dark:text-white ${event.completed ? "line-through opacity-60" : ""}`}
                    >
                      {event.title}
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
                        {event.priority} Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {event.date}
                    {event.time ? ` · ${event.time}` : ""} · {event.projectName || "General"}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => onArchive(event.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                    title="Archive"
                  >
                    <Archive size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(event.id)}
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
              <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300">
                Draft Events
              </h3>
              <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-[10px] font-bold rounded-full">
                {draftEvents.length}
              </span>
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
                  <span className="text-xs font-bold text-[#142843] dark:text-white truncate">
                    {e.title || "Untitled Draft"}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                  Continue editing →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
