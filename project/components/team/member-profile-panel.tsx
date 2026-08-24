"use client";

<<<<<<< HEAD
import { getMemberCommentsAction, getMemberTasksAction } from "@/actions/member-actions";
import { useUserProfile } from "@/context/user-profile-context";
import type { TeamMember } from "@/lib/team-data";
import { Check, ChevronDown, Clock, Filter, MessageSquare, Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MemberProfilePanelProps {
  member: TeamMember | null;
  allMembers: TeamMember[];
  onSelectMember: (m: TeamMember) => void;
  projectId: string;
  projectOwnerName: string;
  projectDescription?: string | null;
=======
import type { TeamMember } from "@/lib/team-data";
import { Clock, Filter, MessageSquare, Plus, Search, X } from "lucide-react";
import { useState } from "react";

interface MemberProfilePanelProps {
  member: TeamMember | null;
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
  onClose: () => void;
}

const STATUS_DOT: Record<TeamMember["status"], string> = {
  Online: "bg-green-500",
  Away: "bg-amber-500",
<<<<<<< HEAD
  Offline: "bg-slate-300 dark:bg-slate-500",
=======
  Offline: "bg-slate-300",
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

<<<<<<< HEAD
const TABS = ["Activity", "Task", "Comments"] as const;

export function MemberProfilePanel({
  member,
  allMembers,
  onSelectMember,
  projectId,
  projectOwnerName,
  projectDescription,
  onClose,
}: MemberProfilePanelProps) {
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Activity");
  const [tasks, setTasks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Member switcher dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Interactive states (persisted per member in localStorage)
  const [timeOff, setTimeOff] = useState<string | null>(null);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [isAddingPriority, setIsAddingPriority] = useState(false);
  const [newPriority, setNewPriority] = useState("");
  const [activities, setActivities] = useState<{ id: string; text: string; time: string }[]>([]);

  // Check if the currently viewed member is the logged-in user
  const isCurrentUser = !!member && member.email === profile.email;

  // Use profile data for the logged-in user
  const displayName = isCurrentUser ? profile.fullName : (member?.name ?? "");
  const displayEmail = isCurrentUser ? profile.email : (member?.email ?? "");
  const displayRole = isCurrentUser ? profile.role : (member?.role ?? "");
  const displayAvatar = isCurrentUser ? profile.avatarUrl : member?.avatarUrl;

  // Reset tabs & data when member changes
  useEffect(() => {
    setActiveTab("Activity");
    setTasks([]);
    setComments([]);
  }, [member?.id]);

  // ── Load persisted metadata ──
  useEffect(() => {
    if (!member) return;
    const key = `syntraflow_member_meta_${member.id}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTimeOff(parsed.timeOff ?? null);
        setPriorities(parsed.priorities ?? []);
        setActivities(parsed.activities ?? []);
      } else {
        setTimeOff(null);
        setPriorities([]);
        setActivities([]);
      }
    } catch {
      /* ignore */
    }
  }, [member?.id]);

  // ── Auto-record time off when user leaves the site ──
  useEffect(() => {
    if (!member) return;
    const key = `syntraflow_member_meta_${member.id}`;

    const handleUnload = () => {
      try {
        const saved = localStorage.getItem(key);
        const parsed = saved ? JSON.parse(saved) : {};
        const now = new Date();
        const timeStr =
          now.toLocaleDateString([], { month: "short", day: "numeric" }) +
          " at " +
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        localStorage.setItem(key, JSON.stringify({ ...parsed, timeOff: `Left on ${timeStr}` }));
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [member?.id]);

  // ── Fetch tasks / comments on tab switch ──
  useEffect(() => {
    if (!member?.userId || !projectId) return;

    if (activeTab === "Task" && tasks.length === 0) {
      setLoading(true);
      getMemberTasksAction(member.userId, projectId)
        .then(setTasks)
        .finally(() => setLoading(false));
    }
    if (activeTab === "Comments" && comments.length === 0) {
      setLoading(true);
      getMemberCommentsAction(member.userId, projectId)
        .then(setComments)
        .finally(() => setLoading(false));
    }
  }, [activeTab, member?.userId, projectId]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!member) return null;

  const notLinked = !member.userId;

  // ── Persist helper ──
  const saveMeta = (
    patch: {
      timeOff?: string | null;
      priorities?: string[];
      activities?: { id: string; text: string; time: string }[];
    },
    activityText?: string,
  ) => {
    const key = `syntraflow_member_meta_${member.id}`;
    let newActivities = patch.activities ?? activities;

    if (activityText) {
      const timeStr =
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
        " " +
        new Date().toLocaleDateString();
      newActivities = [
        { id: crypto.randomUUID(), text: activityText, time: timeStr },
        ...newActivities,
      ];
    }

    const newData = {
      timeOff: patch.timeOff !== undefined ? patch.timeOff : timeOff,
      priorities: patch.priorities ?? priorities,
      activities: newActivities,
    };

    setTimeOff(newData.timeOff);
    setPriorities(newData.priorities);
    setActivities(newData.activities);

    try {
      localStorage.setItem(key, JSON.stringify(newData));
    } catch {
      /* ignore */
    }
  };
=======
const TABS = ["Activity", "Task", "Comments", "Calendar"] as const;

export function MemberProfilePanel({ member, onClose }: MemberProfilePanelProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Activity");

  if (!member) return null;
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0f1d31]">
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-start gap-3 min-w-0">
            {/* Avatar + Member switcher dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-[#142843] ring-2 ring-transparent hover:ring-[#00b4d8] transition-all"
                title="Switch member"
              >
                {displayAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-white">{initials(displayName)}</span>
                )}
                <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow">
                  <ChevronDown size={11} className="text-slate-500" />
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-16 z-50 w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#14263e] shadow-xl overflow-hidden">
                  <p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700">
                    Switch Profile
                  </p>
                  {allMembers.length === 0 && (
                    <p className="px-3 py-2 text-xs text-slate-400">No members</p>
                  )}
                  {allMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMember(m);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${m.id === member.id ? "bg-blue-50/60 dark:bg-blue-950/20" : ""}`}
                    >
                      <div className="h-7 w-7 rounded-lg overflow-hidden bg-[#142843] shrink-0 flex items-center justify-center">
                        {m.avatarUrl ? (
                          <img
                            src={m.avatarUrl}
                            alt={m.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-white">
                            {initials(m.name)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {m.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
                      </div>
                      {m.id === member.id && <Check size={12} className="text-blue-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
<<<<<<< HEAD

            {/* Name, role, message button */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-800 dark:text-white leading-snug truncate">
                {displayName}
              </h2>
              {/* Role instead of description */}
              <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
                {displayRole || "—"}
              </p>
              {/* Message icon under the name */}
              <button className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#00b4d8] dark:hover:text-sky-400 transition-colors">
                <MessageSquare size={14} />
                <span>Message</span>
=======
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">{member.name}</h2>
              <button className="mb-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                Add description...
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
              </button>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[member.status]}`} />
                {member.status}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-slate-100 px-5 dark:border-slate-800">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "border-[#142843] text-[#142843] dark:border-white dark:text-white"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {tab === "Task" ? `Task (${tasks.length})` : tab}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ACTIVITY TAB */}
          {activeTab === "Activity" && (
            <>
              {/* Time Off — auto-set on unload */}
              <div className="mb-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                  Time Off
                </p>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/30 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Clock size={12} className="shrink-0 text-slate-400" />
                  {timeOff ?? "No recorded time off yet"}
                </div>
              </div>

              {/* Project Manager */}
              <div className="mb-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                  Project Manager
                </p>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/30 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {projectOwnerName || "—"}
                </div>
              </div>

              {/* Email */}
              <div className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                  Email
                </p>
                <p>{displayEmail}</p>
              </div>

              {/* Priorities */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Priorities
                  </h3>
                  <button
                    onClick={() => setIsAddingPriority(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#142843] hover:underline dark:text-blue-300"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>

                {isAddingPriority && (
                  <div className="mb-3 flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter important task..."
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newPriority.trim()) {
                          saveMeta(
                            { priorities: [...priorities, newPriority.trim()] },
                            `Added priority: ${newPriority.trim()}`,
                          );
                          setNewPriority("");
                          setIsAddingPriority(false);
                        }
                        if (e.key === "Escape") setIsAddingPriority(false);
                      }}
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                    />
                    <button
                      onClick={() => {
                        if (newPriority.trim()) {
                          saveMeta(
                            { priorities: [...priorities, newPriority.trim()] },
                            `Added priority: ${newPriority.trim()}`,
                          );
                          setNewPriority("");
                        }
                        setIsAddingPriority(false);
                      }}
                      className="rounded bg-[#142843] dark:bg-blue-600 text-white px-2.5 py-1 text-xs font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsAddingPriority(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {priorities.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 p-4 text-center text-xs text-slate-400">
                    Add your most important task here
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {priorities.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <span>{p}</span>
                        <button
                          onClick={() => {
                            const updated = priorities.filter((_, i) => i !== idx);
                            saveMeta({ priorities: updated }, `Removed priority: ${p}`);
                          }}
                          className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Log */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Activity</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Search size={14} />
                    <Filter size={14} />
                  </div>
                </div>
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Only the last 24 hours of activities will be shown here
                  </p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex justify-between rounded bg-slate-50 dark:bg-slate-800/20 p-2 text-xs text-slate-500 dark:text-slate-400"
                      >
                        <span>{act.text}</span>
                        <span className="ml-2 shrink-0 text-[10px] text-slate-400">{act.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TASK TAB */}
          {activeTab === "Task" &&
            (notLinked ? (
              <p className="text-xs text-slate-400">
                This member hasn't linked an account yet — no task data available.
              </p>
            ) : loading ? (
              <p className="text-xs text-slate-400">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-xs text-slate-400">No tasks assigned in this project.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-sm"
                  >
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{t.title}</p>
                    <p className="text-xs text-slate-400">
                      {t.status}
                      {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ))}

          {/* COMMENTS TAB */}
          {activeTab === "Comments" &&
            (notLinked ? (
              <p className="text-xs text-slate-400">This member hasn't linked an account yet.</p>
            ) : loading ? (
              <p className="text-xs text-slate-400">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-400">No comments yet.</p>
            ) : (
              <ul className="space-y-2">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-sm"
                  >
                    <p className="text-xs font-semibold text-slate-500">{c.taskTitle}</p>
                    <p className="text-slate-700 dark:text-slate-200">{c.content}</p>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </aside>
    </>
  );
}
