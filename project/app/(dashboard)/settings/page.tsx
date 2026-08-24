"use client";

<<<<<<< HEAD
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
=======
import { useCategories } from "@/context/category-context";
import { useUserProfile } from "@/context/user-profile-context";
import { Bell, Camera, CheckCircle2, Palette, Save, Shield, Tags, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)

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
<<<<<<< HEAD
  const { profile } = useUserProfile();
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
=======
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { categories, addCategory, removeCategory } = useCategories();
  const [newCategory, setNewCategory] = useState("");

  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)

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

<<<<<<< HEAD
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
=======
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [compactMode, setCompactMode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "profile") {
      updateProfile({ fullName, email, role, avatarUrl: avatarPreview });
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  const navItems = [
    { id: "profile" as SettingsTab, name: "Profile", icon: User },
    { id: "notification" as SettingsTab, name: "Notification", icon: Bell },
    { id: "security" as SettingsTab, name: "Security", icon: Shield },
    { id: "appearance" as SettingsTab, name: "Appearance", icon: Palette },
    { id: "categories" as SettingsTab, name: "Categories", icon: Tags },
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
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

<<<<<<< HEAD
        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* REDESIGNED LEFT SIDEBAR */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* 1. Profile Hero Card */}
            <div className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
              {/* Header Banner */}
              <div className="h-16 bg-gradient-to-r from-[#0f2d5a] via-[#0052cc] to-[#142843] relative" />
=======
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-extrabold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#142843] text-white shadow-md scale-[1.02]"
                      : "text-[#142843] dark:text-purple-200 hover:bg-white/60 dark:hover:bg-purple-900/40 hover:scale-[1.01] hover:shadow-sm"
                  }`}
                  suppressHydrationWarning
                >
                  <item.icon
                    size={19}
                    className={isActive ? "text-white" : "text-[#142843] dark:text-purple-300"}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)

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
<<<<<<< HEAD
                    <div className="flex items-center gap-3 min-w-0">
=======
                    <Camera size={22} className="text-white" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-extrabold text-[#142843] dark:text-slate-200">
                    Profile Picture
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    JPG, PNG or GIF · Max 5 MB
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0052cc] hover:bg-[#003d99] text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                      suppressHydrationWarning
                    >
                      <Camera size={13} />
                      Upload Photo
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        suppressHydrationWarning
                      >
                        <X size={13} />
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-extrabold text-[#142843] dark:text-slate-200 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-[#142843] dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] transition-shadow hover:shadow-sm"
                    suppressHydrationWarning
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-[#142843] dark:text-slate-200 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-[#142843] dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] transition-shadow hover:shadow-sm"
                    suppressHydrationWarning
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-[#142843] dark:text-slate-200 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-[#142843] dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] transition-shadow hover:shadow-sm"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setFullName(profile.fullName);
                    setEmail(profile.email);
                    setRole(profile.role);
                    setAvatarPreview(profile.avatarUrl);
                  }}
                  className={cancelBtn}
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button type="submit" className={saveBtn} suppressHydrationWarning>
                  <Save size={15} />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "notification" && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#142843] dark:text-white tracking-tight">
                Notification Settings
              </h2>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-700/60">
                {[
                  {
                    label: "Email Notifications",
                    desc: "Receive project updates, comments, and task deadlines via email",
                    checked: emailNotifs,
                    set: setEmailNotifs,
                  },
                  {
                    label: "Push Notifications",
                    desc: "Get real-time browser notifications for urgent activity",
                    checked: pushNotifs,
                    set: setPushNotifs,
                  },
                  {
                    label: "Task Assignment Alerts",
                    desc: "Notify instantly when you are assigned to a task or project",
                    checked: taskAlerts,
                    set: setTaskAlerts,
                  },
                  {
                    label: "Weekly Summary Digest",
                    desc: "Receive a weekly productivity report every Monday morning",
                    checked: weeklyDigest,
                    set: setWeeklyDigest,
                  },
                ].map(({ label, desc, checked, set }) => (
                  <div key={label} className="flex items-center justify-between pt-4 first:pt-2">
                    <div>
                      <h4 className="font-extrabold text-[#142843] dark:text-white text-base">
                        {label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => set(e.target.checked)}
                      className="w-5 h-5 accent-[#0052cc] rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setEmailNotifs(true);
                    setPushNotifs(true);
                    setTaskAlerts(true);
                    setWeeklyDigest(false);
                  }}
                  className={cancelBtn}
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button type="submit" className={saveBtn} suppressHydrationWarning>
                  <Save size={15} />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === "security" && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#142843] dark:text-white tracking-tight">
                Security Settings
              </h2>

              <div className="space-y-5">
                {[
                  { label: "Current Password", value: currentPassword, set: setCurrentPassword },
                  { label: "New Password", value: newPassword, set: setNewPassword },
                  {
                    label: "Confirm New Password",
                    value: confirmPassword,
                    set: setConfirmPassword,
                  },
                ].map(({ label, value, set }) => (
                  <div key={label}>
                    <label className="block text-sm font-extrabold text-[#142843] dark:text-slate-200 mb-2">
                      {label}
                    </label>
                    <input
                      type="password"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-5 py-3 border-2 border-[#142843] dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] transition-shadow hover:shadow-sm"
                      suppressHydrationWarning
                    />
                  </div>
                ))}

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="font-extrabold text-[#142843] dark:text-white text-base">
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Add an extra layer of security using an authenticator app
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                    className="w-5 h-5 accent-[#0052cc] rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setTwoFactor(false);
                  }}
                  className={cancelBtn}
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button type="submit" className={saveBtn} suppressHydrationWarning>
                  <Save size={15} />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* ── APPEARANCE TAB ── */}
          {activeTab === "appearance" && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#142843] dark:text-white tracking-tight">
                Appearance Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-extrabold text-[#142843] dark:text-slate-200 mb-3">
                    Theme Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["light", "dark", "system"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setThemeMode(mode)}
                        className={`py-3 px-4 rounded-xl border-2 font-bold text-sm capitalize transition-all hover:scale-[1.03] ${
                          themeMode === mode
                            ? "border-[#0052cc] bg-[#0052cc] text-white shadow-md"
                            : "border-slate-300 dark:border-slate-600 text-[#142843] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        }`}
                        suppressHydrationWarning
                      >
                        {mode} Mode
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="font-extrabold text-[#142843] dark:text-white text-base">
                      Compact Sidebar
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Minimize sidebar by default to maximize your workspace screen size
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="w-5 h-5 accent-[#0052cc] rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode("light");
                    setCompactMode(false);
                  }}
                  className={cancelBtn}
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button type="submit" className={saveBtn} suppressHydrationWarning>
                  <Save size={15} />
                  Save Changes
                </button>
              </div>
            </form>
          )}
          {/* ── CATEGORIES TAB ── */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#142843] dark:text-white tracking-tight">
                Project Categories
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-extrabold text-[#142843] dark:text-slate-200 mb-2">
                    Add New Category
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCategory(newCategory);
                          setNewCategory("");
                        }
                      }}
                      placeholder="e.g. Blockchain"
                      className="flex-1 px-5 py-3 border-2 border-[#142843] dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] transition-shadow hover:shadow-sm"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addCategory(newCategory);
                        setNewCategory("");
                      }}
                      className="px-5 py-3 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                    >
                      Add Category
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-extrabold text-[#142843] dark:text-slate-200 mb-3">
                    Active Categories
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {categories.map((cat: string) => (
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
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
