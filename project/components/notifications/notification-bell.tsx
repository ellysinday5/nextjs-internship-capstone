"use client";

import {
  type NotificationWithActor,
  getRecentNotificationsAction,
  getUnreadNotificationCountAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/actions/notification-actions";
import { InvitationDetailModal } from "@/components/notifications/invitation-detail-modal";
import { Bell, Check, FolderKanban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedInviteNotification, setSelectedInviteNotification] =
    useState<NotificationWithActor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const [notifsRes, countRes] = await Promise.all([
        getRecentNotificationsAction(10),
        getUnreadNotificationCountAction(),
      ]);
      if (notifsRes.success && notifsRes.data) setNotifications(notifsRes.data);
      if (countRes.success && typeof countRes.data === "number") setUnreadCount(countRes.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsAsReadAction();
    refresh();
  }

  async function handleNotificationClick(notification: NotificationWithActor) {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationAsReadAction(notification.id).catch(console.error);
    }

    setOpen(false);

    // Project Invitation -> Open Inline Detail/Accept Modal
    if (
      notification.type === "project_invite" ||
      notification.type === ("project_invitation" as any)
    ) {
      setSelectedInviteNotification(notification);
      return;
    }

    // Other notification types -> Navigate to resource href
    if (notification.href) {
      router.push(notification.href);
    }
  }

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/15 hover:shadow-[0_0_12px_2px_rgba(255,255,255,0.12)] transition-all duration-200 relative cursor-pointer"
          aria-label="Notifications"
          suppressHydrationWarning
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center shadow-md">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Check size={13} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-0.5">We&apos;ll notify you when things happen.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left block px-4 py-3 transition-colors cursor-pointer ${
                      !n.isRead
                        ? "bg-blue-50/70 hover:bg-blue-50 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {n.type === "project_invite" && (
                          <FolderKanban
                            size={13}
                            className="text-blue-600 dark:text-blue-400 shrink-0"
                          />
                        )}
                        <p className="text-sm font-semibold leading-snug line-clamp-1 text-slate-800 dark:text-slate-100">
                          {n.title}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-1.5" />
                      )}
                    </div>
                    {n.message && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                      {n.type === "project_invite" && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                          Review Invite &rarr;
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block text-center py-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 transition-colors"
            >
              Settings &amp; Preferences
            </Link>
          </div>
        )}
      </div>

      {/* Inline Project Invitation Detail / Accept Modal */}
      <InvitationDetailModal
        isOpen={Boolean(selectedInviteNotification)}
        notification={selectedInviteNotification}
        onClose={() => setSelectedInviteNotification(null)}
        onSuccess={refresh}
      />
    </>
  );
}
