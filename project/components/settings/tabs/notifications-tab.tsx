"use client";

import {
  type NotificationWithActor,
  getAllNotificationsAction,
  getUnreadNotificationCountAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/actions/notification-actions";
import { sileo } from "@/utils/alerts";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Info,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

type NotifFilterType = "all" | "task" | "mention" | "invite" | "system";

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
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

const NOTIFS_PER_PAGE = 6;

export function NotificationsTab() {
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<NotifFilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // User notification preferences state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const fetchRealNotifications = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const [notifsRes, countRes] = await Promise.all([
        getAllNotificationsAction(1, 50),
        getUnreadNotificationCountAction(),
      ]);

      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data);
      }
      if (countRes.success && typeof countRes.data === "number") {
        setUnreadCount(countRes.data);
      }
    } catch (err) {
      console.error("Failed to load real notifications:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRealNotifications(true);
    const interval = setInterval(() => fetchRealNotifications(false), 20000);
    return () => clearInterval(interval);
  }, [fetchRealNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      sileo.success("All notifications marked as read.", "Inbox Cleared");
    } catch {
      sileo.error("Failed to mark notifications as read.", "Error");
    }
  };

  const handleMarkSingleRead = async (notificationId: string) => {
    try {
      await markNotificationAsReadAction(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Filter notifications based on type
  const filteredNotifs = notifications.filter((notif) => {
    if (selectedFilter === "all") return true;
    const typeStr = (notif.type || "").toLowerCase();
    if (selectedFilter === "task") return typeStr.includes("task");
    if (selectedFilter === "mention")
      return typeStr.includes("mention") || typeStr.includes("comment");
    if (selectedFilter === "invite") return typeStr.includes("invite") || typeStr.includes("team");
    if (selectedFilter === "system")
      return (
        !typeStr.includes("task") && !typeStr.includes("mention") && !typeStr.includes("invite")
      );
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredNotifs.length / NOTIFS_PER_PAGE));
  const pagedNotifs = filteredNotifs.slice(
    (currentPage - 1) * NOTIFS_PER_PAGE,
    currentPage * NOTIFS_PER_PAGE,
  );

  const filterTabs: {
    key: NotifFilterType;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { key: "all", label: "All", icon: Bell },
    { key: "task", label: "Tasks", icon: CheckCheck },
    { key: "mention", label: "Mentions", icon: Star },
    { key: "invite", label: "Invites", icon: UserPlus },
    { key: "system", label: "System", icon: Info },
  ];

  const PREFS = [
    {
      label: "Email Notifications",
      desc: "Receive real-time updates and activity summaries via email",
      checked: emailNotifs,
      onChange: setEmailNotifs,
    },
    {
      label: "Push Notifications",
      desc: "Get instant desktop alerts for urgent tasks and mentions",
      checked: pushNotifs,
      onChange: setPushNotifs,
    },
    {
      label: "Task Assignment Alerts",
      desc: "Notify instantly when someone assigns or reassigns a task to you",
      checked: taskAlerts,
      onChange: setTaskAlerts,
    },
    {
      label: "Weekly Summary Digest",
      desc: "Receive a compiled weekly productivity and milestone report",
      checked: weeklyDigest,
      onChange: setWeeklyDigest,
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-7">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#0052cc] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all cursor-pointer"
            >
              <Check size={13} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.key;
          const count =
            tab.key === "all"
              ? notifications.length
              : notifications.filter((n) => {
                  const t = (n.type || "").toLowerCase();
                  if (tab.key === "task") return t.includes("task");
                  if (tab.key === "mention") return t.includes("mention") || t.includes("comment");
                  if (tab.key === "invite") return t.includes("invite") || t.includes("team");
                  if (tab.key === "system")
                    return !t.includes("task") && !t.includes("mention") && !t.includes("invite");
                  return true;
                }).length;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0052cc] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <tab.icon size={13} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="space-y-2.5 min-h-[220px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 size={28} className="animate-spin text-[#0052cc] mb-3" />
            <p className="text-xs font-semibold">Loading your notifications...</p>
          </div>
        ) : pagedNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#0052cc] dark:text-sky-400 mb-3">
              <Bell size={22} className="opacity-70" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No notifications found
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {selectedFilter === "all"
                ? "You're all caught up! New workspace activities, assignments, and invites will appear here."
                : `No notifications matching the "${selectedFilter}" category.`}
            </p>
          </div>
        ) : (
          pagedNotifs.map((notif) => {
            const isUnread = !notif.isRead;
            const timeFormatted = notif.createdAt
              ? new Date(notif.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now";

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                  isUnread
                    ? "border-[#0052cc]/30 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#14263e] hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {/* Icon box */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUnread
                      ? "bg-[#0052cc] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {(notif.type || "").toLowerCase().includes("task") ? (
                    <CheckCheck size={16} />
                  ) : (notif.type || "").toLowerCase().includes("mention") ? (
                    <Star size={16} />
                  ) : (notif.type || "").toLowerCase().includes("invite") ? (
                    <UserPlus size={16} />
                  ) : (
                    <Info size={16} />
                  )}
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
                  </div>

                  {notif.message && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  )}

                  {notif.actor && (
                    <span className="inline-block text-[11px] text-[#0052cc] dark:text-sky-400 font-semibold mt-1.5">
                      By {notif.actor.name || notif.actor.email}
                    </span>
                  )}
                </div>

                {/* Action Link / Mark Read */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {notif.href && (
                    <Link
                      href={notif.href}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-400 hover:text-[#0052cc] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                      title="Open related item"
                    >
                      <ExternalLink size={13} />
                    </Link>
                  )}
                  {isUnread && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkSingleRead(notif.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages} ({filteredNotifs.length} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[#142843] dark:text-white">Delivery Preferences</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure how and when SyntraFlow delivers notifications to you.
          </p>
        </div>

        <div className="space-y-3">
          {PREFS.map(({ label, desc, checked, onChange }) => (
            <div
              key={label}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-[#142843] dark:text-white text-xs">{label}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
              </div>
              <ToggleSwitch checked={checked} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
