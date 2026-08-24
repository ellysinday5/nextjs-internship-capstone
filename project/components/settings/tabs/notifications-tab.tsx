"use client";

import { AlertTriangle, Bell, CheckCheck, Info, Star, X } from "lucide-react";
import React, { useState } from "react";

type NotifType = "task" | "mention" | "invite" | "system";
type NotifCategory = "all" | NotifType;

interface NotifItem {
  id: string;
  type: NotifType;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
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

const NOTIFS_PER_PAGE = 5;

const INITIAL_NOTIFS: NotifItem[] = [
  {
    id: "1",
    type: "task",
    title: "Task assigned to you",
    desc: 'You were assigned "Design homepage mockup" in Project Alpha.',
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "mention",
    title: "You were mentioned",
    desc: 'Sarah mentioned you in a comment on "API Integration" task.',
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "invite",
    title: "Project invitation",
    desc: 'You were invited to join the "Mobile Redesign" project by James.',
    time: "1 hr ago",
    read: false,
  },
  {
    id: "4",
    type: "task",
    title: "Task deadline approaching",
    desc: '"Deploy staging environment" is due in 2 hours.',
    time: "2 hr ago",
    read: false,
  },
  {
    id: "5",
    type: "system",
    title: "Weekly digest ready",
    desc: "Your productivity summary for the week is ready.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "6",
    type: "mention",
    title: "You were mentioned",
    desc: 'Jake left a comment mentioning you on "Sprint Planning" milestone.',
    time: "2 days ago",
    read: true,
  },
  {
    id: "7",
    type: "task",
    title: "Task completed",
    desc: '"Setup CI/CD pipeline" was marked complete by Maria.',
    time: "3 days ago",
    read: true,
  },
];

export function NotificationsTab() {
  const [notifications, setNotifications] = useState<NotifItem[]>(INITIAL_NOTIFS);
  const [notifCategory, setNotifCategory] = useState<NotifCategory>("all");
  const [notifPage, setNotifPage] = useState(1);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  const dismissNotif = (id: string) => setNotifications((n) => n.filter((x) => x.id !== id));

  const filteredNotifs =
    notifCategory === "all" ? notifications : notifications.filter((n) => n.type === notifCategory);

  const totalNotifPages = Math.max(1, Math.ceil(filteredNotifs.length / NOTIFS_PER_PAGE));
  const pagedNotifs = filteredNotifs.slice(
    (notifPage - 1) * NOTIFS_PER_PAGE,
    notifPage * NOTIFS_PER_PAGE,
  );

  const NOTIF_TABS: { key: NotifCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "task", label: "Tasks" },
    { key: "mention", label: "Mentions" },
    { key: "invite", label: "Invites" },
    { key: "system", label: "System" },
  ];

  const PREFS = [
    {
      label: "Email Notifications",
      desc: "Receive updates via email",
      checked: emailNotifs,
      onChange: setEmailNotifs,
    },
    {
      label: "Push Notifications",
      desc: "Get real-time browser notifications",
      checked: pushNotifs,
      onChange: setPushNotifs,
    },
    {
      label: "Task Assignment Alerts",
      desc: "Notify instantly when assigned to a task",
      checked: taskAlerts,
      onChange: setTaskAlerts,
    },
    {
      label: "Weekly Summary Digest",
      desc: "Receive productivity report weekly",
      checked: weeklyDigest,
      onChange: setWeeklyDigest,
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Notifications list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#142843] dark:text-white">
              My Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0052cc] text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold text-[#0052cc] hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 mb-3">
          {NOTIF_TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? notifications.length
                : notifications.filter((n) => n.type === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setNotifCategory(tab.key);
                  setNotifPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px cursor-pointer ${
                  notifCategory === tab.key
                    ? "border-[#0052cc] text-[#0052cc] bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {tab.label}
                <span className="px-1.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List items */}
        <div className="space-y-2">
          {pagedNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No notifications in this category.</p>
            </div>
          ) : (
            pagedNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 group transition-all ${
                  notif.read
                    ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] opacity-70"
                    : "border-[#0052cc]/30 bg-blue-50/40 dark:bg-blue-950/10"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 mt-0.5 text-[#0052cc]">
                  {notif.type === "task" ? (
                    <CheckCheck size={14} />
                  ) : notif.type === "mention" ? (
                    <Star size={14} />
                  ) : notif.type === "invite" ? (
                    <Info size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#142843] dark:text-white">
                      {notif.title}
                    </span>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-[#0052cc] shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissNotif(notif.id)}
                  className="p-1 rounded text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Dismiss"
                >
                  <X size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalNotifPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setNotifPage((p) => Math.max(1, p - 1))}
              disabled={notifPage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            <span className="text-xs text-slate-500">
              {notifPage} / {totalNotifPages}
            </span>
            <button
              type="button"
              onClick={() => setNotifPage((p) => Math.min(totalNotifPages, p + 1))}
              disabled={notifPage === totalNotifPages}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-[#142843] dark:text-white mb-3">
          Notification Preferences
        </h3>
        <div className="space-y-2.5">
          {PREFS.map(({ label, desc, checked, onChange }) => (
            <div
              key={label}
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl"
            >
              <div>
                <h4 className="font-semibold text-[#142843] dark:text-white text-xs">{label}</h4>
                <p className="text-[11px] text-slate-400">{desc}</p>
              </div>
              <ToggleSwitch checked={checked} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
