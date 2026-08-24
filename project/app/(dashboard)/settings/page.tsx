"use client";

import { getUnreadNotificationCountAction } from "@/actions/notification-actions";
import { AppearanceTab } from "@/components/settings/tabs/appearance-tab";
import { CategoriesTab } from "@/components/settings/tabs/categories-tab";
import { NotificationsTab } from "@/components/settings/tabs/notifications-tab";
import { ProfileTab } from "@/components/settings/tabs/profile-tab";
import { SecurityTab } from "@/components/settings/tabs/security-tab";
import { useUserProfile } from "@/context/user-profile-context";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Mail,
  Palette,
  Shield,
  ShieldCheck,
  Sparkles,
  Tags,
  User,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";

type SettingsTab = "profile" | "appearance" | "categories" | "security" | "notification";

interface NavItem {
  id: SettingsTab;
  name: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { profile } = useUserProfile();
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      try {
        const res = await getUnreadNotificationCountAction();
        if (res.success && typeof res.data === "number") {
          setUnreadNotifCount(res.data);
        }
      } catch {
        // Fallback
      }
    }
    loadCount();
  }, []);

  const initials = (profile.fullName || "User")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const NAV_ITEMS: NavItem[] = [
    {
      id: "profile",
      name: "Profile Settings",
      desc: "Personal info, photo, and metrics",
      icon: User,
    },
    {
      id: "appearance",
      name: "Appearance & Theme",
      desc: "Dark mode, themes, and density",
      icon: Palette,
    },
    {
      id: "categories",
      name: "Project Categories",
      desc: "Tags and classification labels",
      icon: Tags,
    },
    {
      id: "security",
      name: "Security & Access",
      desc: "Passwords, 2FA, and sessions",
      icon: Shield,
    },
    {
      id: "notification",
      name: "Notifications",
      desc: "Activity alerts and preferences",
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
    },
  ];

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8 bg-[#f8fafc] dark:bg-[#0b1728] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142843] dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account preferences, system appearance, project categories, and security.
          </p>
        </div>

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* REDESIGNED LEFT SIDEBAR */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* 1. Profile Hero Card */}
            <div className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
              {/* Header Banner */}
              <div className="h-16 bg-gradient-to-r from-[#0f2d5a] via-[#0052cc] to-[#142843] relative" />

              {/* Avatar protruding over header */}
              <div className="px-5 pb-5 -mt-8 flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#14263e] shadow-md bg-white dark:bg-slate-800">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt="Profile preview"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#0f2d5a] to-[#0052cc] flex items-center justify-center text-white text-xl font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#14263e] flex items-center justify-center">
                    <CheckCircle2 size={8} className="text-white" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#142843] dark:text-white truncate max-w-full">
                  {profile.fullName || "User"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-full mb-2">
                  {profile.email || "user@syntraflow.com"}
                </p>

                <span className="text-[10px] font-bold text-[#0052cc] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/30 px-2.5 py-0.5 rounded-full">
                  {profile.role || "Member"}
                </span>
              </div>
            </div>

            {/* 2. Navigation Menu */}
            <nav className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-2 space-y-1">
              <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Navigation
              </div>

              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between w-full p-3 rounded-xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? "bg-[#0052cc] text-white shadow-sm shadow-blue-500/20 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                    }`}
                    suppressHydrationWarning
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-[#0052cc] dark:group-hover:text-sky-400"
                        }`}
                      >
                        <item.icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs truncate">{item.name}</span>
                        <span
                          className={`block text-[10px] truncate ${
                            isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? "bg-white text-[#0052cc]" : "bg-[#0052cc] text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${
                          isActive
                            ? "translate-x-0.5 text-white"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* 3. Help & Support Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/40 dark:to-blue-950/20 border border-slate-200 dark:border-slate-700/80">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[#0052cc] dark:text-sky-400 shrink-0">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#142843] dark:text-white">
                    Need assistance?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Check our documentation or contact workspace support.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT PANEL */}
          <main className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
              {activeTab === "profile" && <ProfileTab />}
              {activeTab === "appearance" && <AppearanceTab />}
              {activeTab === "categories" && <CategoriesTab />}
              {activeTab === "security" && <SecurityTab />}
              {activeTab === "notification" && <NotificationsTab />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
