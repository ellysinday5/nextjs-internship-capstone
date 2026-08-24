"use client";

import {
  type NotificationWithActor,
  deleteNotificationAction,
  getAllNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/actions/notification-actions";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Info,
  Loader2,
  Star,
  UserPlus,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifCategory = "all" | "task" | "mention" | "invite" | "system";

interface NotifPrefs {
  emailNotifs: boolean;
  pushNotifs: boolean;
  taskAlerts: boolean;
  weeklyDigest: boolean;
}

const PREFS_STORAGE_KEY = "sf_notif_prefs";

const DEFAULT_PREFS: NotifPrefs = {
  emailNotifs: true,
  pushNotifs: true,
  taskAlerts: true,
  weeklyDigest: false,
};

// ─── Helper: map DB notification type → UI category ──────────────────────────

function dbTypeToCategory(type: string): NotifCategory {
  if (type === "task_assigned" || type === "task_status_changed") return "task";
  if (type === "mentioned" || type === "comment_added") return "mention";
  if (
    type === "project_invite" ||
    type === "workspace_invite" ||
    type === "invite_accepted" ||
    type === "member_added"
  )
    return "invite";
  return "system";
}

function dbTypeToIcon(type: string) {
  const cat = dbTypeToCategory(type);
  if (cat === "task") return <CheckCheck size={14} />;
  if (cat === "mention") return <Star size={14} />;
  if (cat === "invite") return <UserPlus size={14} />;
  return <AlertTriangle size={14} />;
}

/** Returns false if the user's preferences suppress this notification category */
function isAllowedByPrefs(type: string, prefs: NotifPrefs): boolean {
  const cat = dbTypeToCategory(type);
  if (cat === "task" && !prefs.taskAlerts) return false;
  if (cat === "system" && !prefs.weeklyDigest) return false;
  return true;
}

function formatTime(dateStr: string | Date | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:ring-offset-2 ${
        checked ? "bg-[#0052cc]" : "bg-slate-300 dark:bg-slate-600"
      }`}
      suppressHydrationWarning
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NOTIFS_PER_PAGE = 5;

const NOTIF_TABS: { key: NotifCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "task", label: "Tasks" },
  { key: "mention", label: "Mentions" },
  { key: "invite", label: "Invites" },
  { key: "system", label: "System" },
];

export function NotificationsTab() {
  // ── Real notifications from DB ──────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [notifCategory, setNotifCategory] = useState<NotifCategory>("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // ── Preferences (persisted in localStorage) ─────────────────────────────
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [savingPref, setSavingPref] = useState<string | null>(null);

  // ── Load prefs from localStorage on mount ───────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      if (stored) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
      }
    } catch {
      // ignore parse errors
    }
    setPrefsLoaded(true);
  }, []);

  // ── Persist prefs to localStorage whenever they change (after initial load) ─
  useEffect(() => {
    if (!prefsLoaded) return;
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs, prefsLoaded]);

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getAllNotificationsAction(pageNum, NOTIFS_PER_PAGE + 1);
      if (res.success && res.data) {
        const fetched = res.data as NotificationWithActor[];
        setHasMore(fetched.length > NOTIFS_PER_PAGE);
        setNotifications(fetched.slice(0, NOTIFS_PER_PAGE));
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // ── Derived counts & filtered list ──────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifs = notifications.filter((n) => {
    const cat = dbTypeToCategory(n.type);
    if (notifCategory !== "all" && cat !== notifCategory) return false;
    if (!isAllowedByPrefs(n.type, prefs)) return false;
    return true;
  });

  // ── Actions ──────────────────────────────────────────────────────────────
  async function handleMarkAllRead() {
    setIsMarkingAll(true);
    await markAllNotificationsAsReadAction();
    await fetchNotifications(page);
    setIsMarkingAll(false);
  }

  async function handleMarkRead(id: string) {
    await markNotificationAsReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  async function handleDismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotificationAction(id);
  }

  function updatePref<K extends keyof NotifPrefs>(key: K, value: boolean) {
    setSavingPref(key);
    setPrefs((p) => ({ ...p, [key]: value }));
    setTimeout(() => setSavingPref(null), 700);
  }

  const PREF_CONFIG: {
    key: keyof NotifPrefs;
    label: string;
    desc: string;
    note: string | null;
  }[] = [
    {
      key: "emailNotifs",
      label: "Email Notifications",
      desc: "Receive updates via email",
      note: null,
    },
    {
      key: "pushNotifs",
      label: "Push Notifications",
      desc: "Get real-time browser notifications",
      note: null,
    },
    {
      key: "taskAlerts",
      label: "Task Assignment Alerts",
      desc: "Notify instantly when assigned to a task",
      note: "Task notifications are hidden from your list while this is off",
    },
    {
      key: "weeklyDigest",
      label: "Weekly Summary Digest",
      desc: "Receive productivity report weekly",
      note: "System/digest notifications are hidden from your list while this is off",
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* ── Notifications List ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#142843] dark:text-white tracking-tight">
              Notifications &amp; Activity
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#0052cc] text-white animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time feed of task updates, team mentions, invitations, and alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchRealNotifications(false)}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-[#0052cc] dark:hover:text-sky-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Refresh notifications"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-[#0052cc]" : ""} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="text-xs font-semibold text-[#0052cc] hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              {isMarkingAll && <Loader2 size={11} className="animate-spin" />}
              Mark all as read
            </button>
          )}
        </div>
      </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 mb-3 overflow-x-auto">
          {NOTIF_TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? notifications.filter((n) => isAllowedByPrefs(n.type, prefs)).length
                : notifications.filter(
                    (n) =>
                      dbTypeToCategory(n.type) === tab.key &&
                      isAllowedByPrefs(n.type, prefs),
                  ).length;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setNotifCategory(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px cursor-pointer whitespace-nowrap ${
                  notifCategory === tab.key
                    ? "border-[#0052cc] text-[#0052cc] bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

        {/* List items */}
        <div className="space-y-2 min-h-[120px]">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 size={24} className="mx-auto mb-2 animate-spin opacity-40" />
              <p className="text-sm font-semibold">Loading notifications…</p>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">
                {notifCategory === "all"
                  ? "No notifications yet."
                  : `No ${notifCategory} notifications.`}
              </p>
              {notifCategory === "task" && !prefs.taskAlerts && (
                <p className="text-xs mt-1 text-amber-500">
                  Task alerts are disabled in your preferences below.
                </p>
              )}
              {notifCategory === "system" && !prefs.weeklyDigest && (
                <p className="text-xs mt-1 text-amber-500">
                  Weekly digest is disabled in your preferences below.
                </p>
              )}
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 group transition-all ${
                  notif.isRead
                    ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] opacity-70"
                    : "border-[#0052cc]/30 bg-blue-50/40 dark:bg-blue-950/10"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 mt-0.5 text-[#0052cc]">
                  {dbTypeToIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#142843] dark:text-white">
                        {notif.title}
                      </span>
                      {isUnread && <span className="w-2 h-2 rounded-full bg-[#0052cc] shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {timeFormatted}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#0052cc] shrink-0" />
                    )}
                  </div>
                  {notif.message && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-[10px] text-slate-400">{formatTime(notif.createdAt)}</p>
                    {notif.actor && (
                      <p className="text-[10px] text-slate-400">
                        by{" "}
                        <span className="font-semibold text-slate-500">{notif.actor.name}</span>
                      </p>
                    )}
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-[10px] text-[#0052cc] hover:underline cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDismiss(notif.id)}
                  className="p-1 rounded text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Dismiss"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => fetchNotifications(page - 1)}
            disabled={page === 1 || loading}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-slate-500">Page {page}</span>
          <button
            type="button"
            onClick={() => fetchNotifications(page + 1)}
            disabled={!hasMore || loading}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* ── Notification Preferences ───────────────────────────────────────── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-[#142843] dark:text-white mb-1">
          Notification Preferences
        </h3>
        <p className="text-[11px] text-slate-400 mb-3">
          Your preferences are saved automatically and affect which notifications appear in your list.
        </p>
        <div className="space-y-2.5">
          {PREF_CONFIG.map(({ key, label, desc, note }) => (
            <div
              key={key}
              className="flex items-start justify-between p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl gap-4"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[#142843] dark:text-white text-xs">{label}</h4>
                <p className="text-[11px] text-slate-400">{desc}</p>
                {note && !prefs[key] && (
                  <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                    <Info size={9} />
                    {note}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                {savingPref === key && (
                  <span className="text-[10px] text-emerald-500 font-semibold animate-pulse">
                    Saved
                  </span>
                )}
                <ToggleSwitch
                  id={`pref-${key}`}
                  checked={prefs[key]}
                  onChange={(v) => updatePref(key, v)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

