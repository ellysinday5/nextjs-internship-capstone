"use client";

import { AppearanceTab } from "@/components/settings/tabs/appearance-tab";
import { CategoriesTab } from "@/components/settings/tabs/categories-tab";
import { NotificationsTab } from "@/components/settings/tabs/notifications-tab";
import { ProfileTab } from "@/components/settings/tabs/profile-tab";
import { SecurityTab } from "@/components/settings/tabs/security-tab";
import { useUserProfile } from "@/context/user-profile-context";
import { Bell, Palette, Shield, Tags, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type SettingsTab = "profile" | "appearance" | "categories" | "security" | "notification";

const NAV_ITEMS = [
  { id: "profile" as SettingsTab, name: "Profile", icon: User },
  { id: "appearance" as SettingsTab, name: "Appearance", icon: Palette },
  { id: "categories" as SettingsTab, name: "Categories", icon: Tags },
  { id: "security" as SettingsTab, name: "Security", icon: Shield },
  { id: "notification" as SettingsTab, name: "Notification", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { profile } = useUserProfile();

  const initials = (profile.fullName || "User")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8 bg-[#f8fafc] dark:bg-[#0b1728] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142843] dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account preferences, system appearance, project categories, and security.
          </p>
          <hr className="mt-4 border-slate-200 dark:border-slate-800" />
        </div>

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Profile card summary */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2 text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-3 ring-slate-200 dark:ring-slate-700 shadow-sm">
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
                  <div className="w-full h-full bg-gradient-to-tr from-[#0f2d5a] to-[#0052cc] flex items-center justify-center text-white text-xl font-black">
                    {initials}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-[#142843] dark:text-white truncate w-full">
                {profile.fullName || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full">
                {profile.email || "user@syntraflow.com"}
              </p>
              <span className="text-[10px] font-bold text-[#0052cc] dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2.5 py-0.5 rounded-full">
                {profile.role || "Member"}
              </span>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold w-full text-left rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0f2d5a] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                    suppressHydrationWarning
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT CONTENT PANEL */}
          <div className="lg:col-span-9">
            <div className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {activeTab === "profile" && <ProfileTab />}
              {activeTab === "appearance" && <AppearanceTab />}
              {activeTab === "categories" && <CategoriesTab />}
              {activeTab === "security" && <SecurityTab />}
              {activeTab === "notification" && <NotificationsTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
