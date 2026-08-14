"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  User, Bell, Shield, Palette, CheckCircle2, Camera, X, Tags, Sun, Moon, Monitor,
  CheckCheck, Info, AlertTriangle, Star, Eye, EyeOff, Smartphone, Laptop, Globe,
  MapPin, Phone, Link2, AtSign, Hash, Zap, Type, Layers, Plus, Trash2, Lock,
  LogOut, Clock, ChevronRight, Paintbrush,
} from "lucide-react";
import { useUserProfile } from "@/context/user-profile-context";
import { useCategories } from "@/context/category-context";
import Image from "next/image";

type SettingsTab = "profile" | "notification" | "security" | "appearance" | "categories";

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:ring-offset-2 ${
        checked ? "bg-[#0052cc]" : "bg-slate-200 dark:bg-slate-600"
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

export default function SettingsPage() {
  const { profile, updateProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { categories, addCategory, removeCategory } = useCategories();
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#0052cc");

  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);

  useEffect(() => {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setRole(profile.role);
    setAvatarPreview(profile.avatarUrl);
  }, [profile.fullName, profile.email, profile.role, profile.avatarUrl]);

  const initials = fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
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

  type NotifType = "task" | "mention" | "invite" | "system";
  interface NotifItem {
    id: string;
    type: NotifType;
    title: string;
    desc: string;
    time: string;
    read: boolean;
  }
  const [notifications, setNotifications] = useState<NotifItem[]>([
    { id: "1",  type: "task",    title: "Task assigned to you",         desc: "You were assigned \"Design homepage mockup\" in Project Alpha.",               time: "2 min ago",   read: false },
    { id: "2",  type: "mention", title: "You were mentioned",           desc: "Sarah mentioned you in a comment on \"API Integration\" task.",                time: "15 min ago",  read: false },
    { id: "3",  type: "invite",  title: "Project invitation",           desc: "You were invited to join the \"Mobile Redesign\" project by James.",           time: "1 hr ago",    read: false },
    { id: "4",  type: "task",    title: "Task deadline approaching",    desc: "\"Deploy staging environment\" is due in 2 hours.",                            time: "2 hr ago",    read: false },
    { id: "5",  type: "system",  title: "Weekly digest ready",          desc: "Your productivity summary for the week of Dec 2 is ready.",                    time: "Yesterday",   read: true  },
    { id: "6",  type: "mention", title: "You were mentioned",           desc: "Jake left a comment mentioning you on \"Sprint Planning\" milestone.",         time: "2 days ago",  read: true  },
    { id: "7",  type: "task",    title: "Task completed",               desc: "\"Setup CI/CD pipeline\" was marked complete by Maria.",                       time: "3 days ago",  read: true  },
    { id: "8",  type: "invite",  title: "Team invitation accepted",     desc: "Carlos accepted your invitation to the \"Dashboard Revamp\" project.",          time: "4 days ago",  read: true  },
    { id: "9",  type: "task",    title: "New comment on your task",     desc: "Anna left a comment on \"Refactor auth module\": looks good, merging soon.",   time: "4 days ago",  read: true  },
    { id: "10", type: "system",  title: "Scheduled maintenance",        desc: "The platform will undergo maintenance on Saturday, Dec 7 from 2–4 AM UTC.",    time: "5 days ago",  read: true  },
    { id: "11", type: "mention", title: "You were mentioned",           desc: "Leo mentioned you in the \"Q4 Roadmap\" discussion.",                           time: "5 days ago",  read: true  },
    { id: "12", type: "task",    title: "Task overdue",                 desc: "\"Write unit tests for billing module\" is past its due date.",                 time: "6 days ago",  read: true  },
    { id: "13", type: "invite",  title: "Role updated",                 desc: "Your role in \"Frontend Squad\" was updated to Lead by the project owner.",    time: "1 week ago",  read: true  },
    { id: "14", type: "system",  title: "Export ready",                 desc: "Your analytics export for November is ready to download.",                     time: "1 week ago",  read: true  },
    { id: "15", type: "task",    title: "PR review requested",          desc: "Mia requested your review on \"feat/dark-mode\" pull request.",                time: "1 week ago",  read: true  },
    { id: "16", type: "mention", title: "You were mentioned",           desc: "Tom mentioned you in a thread about the new onboarding flow.",                 time: "2 weeks ago", read: true  },
    { id: "17", type: "invite",  title: "Project invitation",           desc: "You were invited to join the \"Data Pipeline\" project by Rachel.",            time: "2 weeks ago", read: true  },
    { id: "18", type: "system",  title: "Password changed",             desc: "Your account password was changed successfully.",                              time: "2 weeks ago", read: true  },
  ]);

  type NotifCategory = "all" | "task" | "mention" | "invite" | "system";
  const [notifCategory, setNotifCategory] = useState<NotifCategory>("all");
  const [notifPage, setNotifPage] = useState(1);
  const NOTIFS_PER_PAGE = 10;

  const notifIcon = (type: NotifType) => {
    if (type === "task")    return <CheckCheck size={14} className="text-[#0052cc]" />;
    if (type === "mention") return <Star size={14} className="text-amber-500" />;
    if (type === "invite")  return <Info size={14} className="text-emerald-500" />;
    return <AlertTriangle size={14} className="text-slate-400" />;
  };
  const notifIconBg = (type: NotifType) => {
    if (type === "task")    return "bg-blue-100 dark:bg-blue-950/60";
    if (type === "mention") return "bg-amber-100 dark:bg-amber-950/60";
    if (type === "invite")  return "bg-emerald-100 dark:bg-emerald-950/60";
    return "bg-slate-100 dark:bg-slate-800";
  };

  const markAllRead  = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  const dismissNotif = (id: string) => setNotifications((n) => n.filter((x) => x.id !== id));
  const unreadCount  = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifCategory === "all"
    ? notifications
    : notifications.filter((n) => n.type === notifCategory);

  const totalNotifPages = Math.max(1, Math.ceil(filteredNotifs.length / NOTIFS_PER_PAGE));
  const pagedNotifs = filteredNotifs.slice((notifPage - 1) * NOTIFS_PER_PAGE, notifPage * NOTIFS_PER_PAGE);

  const notifCategoryTabs: { key: NotifCategory; label: string }[] = [
    { key: "all",     label: "All"      },
    { key: "task",    label: "Tasks"    },
    { key: "mention", label: "Mentions" },
    { key: "invite",  label: "Invites"  },
    { key: "system",  label: "System"   },
  ];

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  }, [newPassword]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"][passwordStrength];
  const strengthText  = ["", "text-red-500", "text-amber-500", "text-sky-500", "text-emerald-500"][passwordStrength];

  const activeSessions = [
    { id: "1", device: "Chrome on Windows", icon: Laptop,     location: "Manila, PH",     time: "Active now",      current: true  },
    { id: "2", device: "Safari on iPhone",  icon: Smartphone, location: "Quezon City, PH", time: "2 hours ago",    current: false },
    { id: "3", device: "Firefox on macOS",  icon: Globe,      location: "Makati, PH",     time: "Yesterday",       current: false },
  ];

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [density, setDensity] = useState<"comfortable" | "compact" | "cozy">("comfortable");
  const [accentColor, setAccentColor] = useState("#0052cc");

  const accentColors = [
    { hex: "#0052cc", label: "Blue"    },
    { hex: "#7c3aed", label: "Violet"  },
    { hex: "#059669", label: "Green"   },
    { hex: "#dc2626", label: "Red"     },
    { hex: "#d97706", label: "Amber"   },
    { hex: "#0891b2", label: "Cyan"    },
    { hex: "#db2777", label: "Pink"    },
    { hex: "#475569", label: "Slate"   },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "profile") {
      updateProfile({ fullName, email, role, avatarUrl: avatarPreview });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const navItems = [
    { id: "profile" as SettingsTab, name: "Profile", icon: User },
    { id: "notification" as SettingsTab, name: "Notification", icon: Bell },
    { id: "security" as SettingsTab, name: "Security", icon: Shield },
    { id: "appearance" as SettingsTab, name: "Appearance", icon: Palette },
    { id: "categories" as SettingsTab, name: "Categories", icon: Tags },
  ];

  const inputClass =
    "w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-[#0052cc] transition-all";
  const cancelBtn =
    "px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors";
  const saveBtn =
    "inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f2d5a] hover:bg-[#0c2447] text-white font-bold text-sm rounded-xl shadow-sm transition-colors";

  const themeOptions = [
    { mode: "light" as const, label: "Light", Icon: Sun },
    { mode: "dark" as const, label: "Dark", Icon: Moon },
    { mode: "system" as const, label: "System", Icon: Monitor },
  ];

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">

        {/* ── PAGE HEADER ── */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142843] dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account preferences, security, and workspace settings.
          </p>
          <hr className="mt-4 border-slate-200 dark:border-slate-700" />
        </div>

        {/* ── TWO-COLUMN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:col-span-3 bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

            {/* Profile card — only when profile tab active */}
            {activeTab === "profile" && (
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2 text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-600 shadow">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Profile preview" width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#0f2d5a] to-[#0052cc] flex items-center justify-center text-white text-lg font-black">
                      {initials || "U"}
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-[#142843] dark:text-white truncate w-full">{fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full">{email}</p>
                <span className="text-[10px] font-bold text-[#0052cc] dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">
                  {role}
                </span>
              </div>
            )}

            {/* Nav */}
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold w-full text-left rounded-xl transition-colors ${
                      isActive
                        ? "bg-[#0f2d5a] text-white"
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

          {/* ── RIGHT CONTENT PANEL ── */}
          <div className="lg:col-span-9">
            <div className={activeTab !== "notification" ? "bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm" : ""}>

            {/* PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave}>
                <div className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#142843] dark:text-white">Profile Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Update your personal information and profile picture.</p>
                    <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                  </div>

                  {/* Avatar + stats strip */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 p-5 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/40 dark:to-blue-950/10 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-700 shadow-lg">
                        {avatarPreview ? (
                          <Image src={avatarPreview} alt="Profile picture" width={96} height={96} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-[#0f2d5a] to-[#0052cc] flex items-center justify-center text-white text-2xl font-black">
                            {initials || "U"}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Change profile picture"
                        suppressHydrationWarning
                      >
                        <Camera size={22} className="text-white" />
                      </button>
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <p className="text-base font-extrabold text-[#142843] dark:text-white">{fullName || "Your Name"}</p>
                        <span className="inline-flex self-center text-[10px] font-bold text-[#0052cc] dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2.5 py-0.5 rounded-full">{role}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{email}</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <span className="flex items-center gap-1"><Clock size={11} />Member since Aug 2026</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0052cc] hover:bg-[#003d99] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                          suppressHydrationWarning
                        >
                          <Camera size={12} /> Change Photo
                        </button>
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all"
                            suppressHydrationWarning
                          >
                            <X size={12} /> Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">JPG, PNG or GIF · Max 5 MB</p>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>

                    {/* Quick stats */}
                    <div className="flex sm:flex-col gap-4 sm:gap-3 shrink-0 text-center">
                      {[
                        { label: "Projects", value: "12" },
                        { label: "Tasks Done", value: "84" },
                        { label: "Teams", value: "3" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col items-center">
                          <span className="text-lg font-extrabold text-[#142843] dark:text-white leading-none">{value}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personal info */}
                  <div className="mb-6">
                    <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"><User size={11} /> Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} suppressHydrationWarning />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"><AtSign size={11} /> Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} suppressHydrationWarning />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"><Hash size={11} /> Role / Title</label>
                        <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} suppressHydrationWarning />
                      </div>

                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Delete Account</h4>
                        <p className="text-xs text-red-500/80 dark:text-red-400/60 mt-0.5">Permanently delete your account and all associated data. This cannot be undone.</p>
                      </div>
                      <button type="button" className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { setFullName(profile.fullName); setEmail(profile.email); setRole(profile.role); setAvatarPreview(profile.avatarUrl); }} className={cancelBtn} suppressHydrationWarning>Cancel</button>
                  <button type="submit" className={saveBtn} suppressHydrationWarning>Save Changes</button>
                </div>
              </form>
            )}

            {/* NOTIFICATION */}
            {activeTab === "notification" && (
              <div className="p-6 sm:p-8 space-y-6">

                {/* ── Container 1: My Notifications ── */}
                <div className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-5 pb-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-[#142843] dark:text-white">My Notifications</h2>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0052cc] text-white">{unreadCount}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs font-semibold text-[#0052cc] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Category Tabs */}
                  <div className="px-6 pt-4 pb-0">
                    <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800">
                      {notifCategoryTabs.map((tab) => {
                        const count = tab.key === "all"
                          ? notifications.length
                          : notifications.filter((n) => n.type === tab.key).length;
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => { setNotifCategory(tab.key); setNotifPage(1); }}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold rounded-t-lg border-b-2 transition-all -mb-px ${
                              notifCategory === tab.key
                                ? "border-[#0052cc] text-[#0052cc] bg-blue-50/50 dark:bg-blue-950/20"
                                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#142843] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/30"
                            }`}
                          >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                              notifCategory === tab.key ? "bg-[#0052cc] text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="px-6 py-4 space-y-2">
                    {pagedNotifs.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <Bell size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold">No notifications in this category.</p>
                      </div>
                    ) : (
                      pagedNotifs.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-2xl border-2 flex items-start gap-3 group transition-all ${
                            notif.read
                              ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] opacity-70"
                              : "border-[#0052cc]/30 bg-blue-50/40 dark:bg-blue-950/10 dark:border-blue-800/40"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notifIconBg(notif.type)}`}>
                            {notifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-sm font-extrabold text-[#142843] dark:text-white ${notif.read ? "opacity-60" : ""}`}>{notif.title}</span>
                              {!notif.read && <span className="w-2 h-2 rounded-full bg-[#0052cc] shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{notif.desc}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{notif.time}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => dismissNotif(notif.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Dismiss"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {filteredNotifs.length > NOTIFS_PER_PAGE && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Showing {(notifPage - 1) * NOTIFS_PER_PAGE + 1}–{Math.min(notifPage * NOTIFS_PER_PAGE, filteredNotifs.length)} of {filteredNotifs.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNotifPage((p) => Math.max(1, p - 1))}
                          disabled={notifPage === 1}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                          {notifPage} / {totalNotifPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNotifPage((p) => Math.min(totalNotifPages, p + 1))}
                          disabled={notifPage === totalNotifPages}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Container 2: Preferences ── */}
                <form onSubmit={handleSave}>
                  <div className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-6">
                      <h2 className="text-base font-black text-[#142843] dark:text-white mb-1">Notification Preferences</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Control how and when you receive notifications.</p>
                      <div className="space-y-3">
                        {[
                          { label: "Email Notifications",    desc: "Receive project updates, comments, and task deadlines via email", checked: emailNotifs, set: setEmailNotifs },
                          { label: "Push Notifications",     desc: "Get real-time browser notifications for urgent activity",         checked: pushNotifs,  set: setPushNotifs  },
                          { label: "Task Assignment Alerts", desc: "Notify instantly when you are assigned to a task or project",     checked: taskAlerts,  set: setTaskAlerts  },
                          { label: "Weekly Summary Digest",  desc: "Receive a weekly productivity report every Monday morning",       checked: weeklyDigest, set: setWeeklyDigest },
                        ].map(({ label, desc, checked, set }) => (
                          <div key={label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                            <div>
                              <h4 className="font-semibold text-[#142843] dark:text-white text-sm">{label}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                            </div>
                            <ToggleSwitch checked={checked} onChange={set} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center justify-end gap-3">
                      <button type="button" onClick={() => { setEmailNotifs(true); setPushNotifs(true); setTaskAlerts(true); setWeeklyDigest(false); }} className={cancelBtn} suppressHydrationWarning>Cancel</button>
                      <button type="submit" className={saveBtn} suppressHydrationWarning>Save Changes</button>
                    </div>
                  </div>
                </form>

              </div>
            )}

            {/* SECURITY */}
            {activeTab === "security" && (
              <form onSubmit={handleSave}>
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#142843] dark:text-white">Security Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your password and account security.</p>
                    <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                  </div>

                  {/* Change Password */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-[#0f2d5a]/10 dark:bg-[#0052cc]/20 flex items-center justify-center">
                        <Lock size={14} className="text-[#0052cc]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#142843] dark:text-white">Change Password</h3>
                        <p className="text-[11px] text-slate-400">Choose a strong, unique password</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {/* Current password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Current Password</label>
                        <div className="relative">
                          <input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pr-11`} suppressHydrationWarning />
                          <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      {/* New password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">New Password</label>
                        <div className="relative">
                          <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pr-11`} suppressHydrationWarning />
                          <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {/* Strength meter */}
                        {newPassword && (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                              {[1,2,3,4].map((i) => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor : "bg-slate-200 dark:bg-slate-700"}`} />
                              ))}
                            </div>
                            <p className={`text-[10px] font-bold ${strengthText}`}>{strengthLabel} password</p>
                            <ul className="mt-1.5 space-y-0.5">
                              {[
                                { check: newPassword.length >= 8, label: "At least 8 characters" },
                                { check: /[A-Z]/.test(newPassword), label: "One uppercase letter" },
                                { check: /[0-9]/.test(newPassword), label: "One number" },
                                { check: /[^A-Za-z0-9]/.test(newPassword), label: "One special character" },
                              ].map(({ check, label }) => (
                                <li key={label} className={`flex items-center gap-1.5 text-[10px] font-medium ${check ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                  <CheckCircle2 size={10} className={check ? "text-emerald-500" : "text-slate-300"} />
                                  {label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {/* Confirm password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pr-11 ${confirmPassword && confirmPassword !== newPassword ? "border-red-400 focus:ring-red-400" : ""}`} suppressHydrationWarning />
                          <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <p className="text-[10px] text-red-500 mt-1 font-medium">Passwords do not match</p>
                        )}
                        {confirmPassword && confirmPassword === newPassword && (
                          <p className="text-[10px] text-emerald-500 mt-1 font-medium flex items-center gap-1"><CheckCircle2 size={10} /> Passwords match</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2FA */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
                          <Smartphone size={14} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#142843] dark:text-white">Two-Factor Authentication</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Extra layer of security via authenticator app</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {twoFactor && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Enabled</span>}
                        <ToggleSwitch checked={twoFactor} onChange={setTwoFactor} />
                      </div>
                    </div>
                    {twoFactor && (
                      <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30 text-xs text-violet-700 dark:text-violet-300 font-medium">
                        2FA is active. Use your authenticator app to generate a code when signing in.
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center">
                        <Globe size={14} className="text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#142843] dark:text-white">Active Sessions</h3>
                        <p className="text-[11px] text-slate-400">Devices currently signed in to your account</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {activeSessions.map((s) => (
                        <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${s.current ? "border-[#0052cc]/20 bg-blue-50/50 dark:bg-blue-950/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a]"}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.current ? "bg-[#0052cc]/10 dark:bg-[#0052cc]/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                            <s.icon size={16} className={s.current ? "text-[#0052cc]" : "text-slate-500"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#142843] dark:text-white truncate">{s.device}</span>
                              {s.current && <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full shrink-0">This device</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{s.location} · {s.time}</p>
                          </div>
                          {!s.current && (
                            <button type="button" className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0">
                              <LogOut size={11} /> Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" className="mt-3 w-full text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                      <LogOut size={13} /> Sign out all other sessions
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setTwoFactor(false); }} className={cancelBtn} suppressHydrationWarning>Cancel</button>
                  <button type="submit" className={saveBtn} suppressHydrationWarning>Save Changes</button>
                </div>
              </form>
            )}

            {/* APPEARANCE */}
            {activeTab === "appearance" && (
              <form onSubmit={handleSave}>
                <div className="p-6 sm:p-8 space-y-7">
                  <div>
                    <h2 className="text-lg font-bold text-[#142843] dark:text-white">Appearance Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Customize the look and feel of your workspace.</p>
                    <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                  </div>

                  {/* Theme */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sun size={14} className="text-slate-400" />
                      <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Theme</label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {themeOptions.map(({ mode, label, Icon }) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setThemeMode(mode)}
                          className={`relative flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl border-2 font-semibold text-sm transition-all ${
                            themeMode === mode
                              ? "border-[#0052cc] bg-[#0052cc]/8 dark:bg-[#0052cc]/20 text-[#0052cc] dark:text-sky-400 shadow-sm"
                              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                          }`}
                          suppressHydrationWarning
                        >
                          {themeMode === mode && <div className="absolute top-2 right-2 w-4 h-4 bg-[#0052cc] rounded-full flex items-center justify-center"><CheckCircle2 size={10} className="text-white" /></div>}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeMode === mode ? "bg-[#0052cc]/10 dark:bg-[#0052cc]/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                            <Icon size={18} />
                          </div>
                          <span className="text-xs font-bold">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent color */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Paintbrush size={14} className="text-slate-400" />
                      <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Accent Color</label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {accentColors.map(({ hex, label }) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setAccentColor(hex)}
                          title={label}
                          className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${accentColor === hex ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110" : ""}`}
                          style={{ backgroundColor: hex }}
                          suppressHydrationWarning
                        >
                          {accentColor === hex && <CheckCircle2 size={14} className="text-white mx-auto" />}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Selected: <span className="font-bold" style={{ color: accentColor }}>{accentColors.find(c => c.hex === accentColor)?.label}</span></p>
                  </div>

                  {/* Font size */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Type size={14} className="text-slate-400" />
                      <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Font Size</label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(["small", "medium", "large"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFontSize(size)}
                          className={`py-3 rounded-xl border-2 font-semibold transition-all text-center ${
                            fontSize === size
                              ? "border-[#0052cc] bg-[#0052cc]/8 text-[#0052cc] dark:text-sky-400"
                              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                          suppressHydrationWarning
                        >
                          <span className={`font-bold ${size === "small" ? "text-xs" : size === "medium" ? "text-sm" : "text-base"}`}>
                            Aa
                          </span>
                          <p className="text-[10px] mt-0.5 capitalize">{size}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Density */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers size={14} className="text-slate-400" />
                      <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Display Density</label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { key: "comfortable", label: "Comfortable", desc: "More spacing" },
                        { key: "cozy",        label: "Cozy",        desc: "Balanced"     },
                        { key: "compact",     label: "Compact",     desc: "Less spacing" },
                      ] as const).map(({ key, label, desc }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDensity(key)}
                          className={`py-3 px-3 rounded-xl border-2 font-semibold transition-all text-left ${
                            density === key
                              ? "border-[#0052cc] bg-[#0052cc]/8 text-[#0052cc] dark:text-sky-400"
                              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                          suppressHydrationWarning
                        >
                          <p className="text-xs font-bold">{label}</p>
                          <p className="text-[10px] mt-0.5 text-slate-400">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <Zap size={13} className="text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#142843] dark:text-white text-sm">Animations</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable transitions and motion effects</p>
                        </div>
                      </div>
                      <ToggleSwitch checked={animationsEnabled} onChange={setAnimationsEnabled} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <Monitor size={13} className="text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#142843] dark:text-white text-sm">Compact Sidebar</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Minimize sidebar to maximize workspace</p>
                        </div>
                      </div>
                      <ToggleSwitch checked={compactMode} onChange={setCompactMode} />
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { setThemeMode("light"); setCompactMode(false); setAnimationsEnabled(true); setFontSize("medium"); setDensity("comfortable"); setAccentColor("#0052cc"); }} className={cancelBtn} suppressHydrationWarning>Cancel</button>
                  <button type="submit" className={saveBtn} suppressHydrationWarning>Save Changes</button>
                </div>
              </form>
            )}

            {/* CATEGORIES */}
            {activeTab === "categories" && (
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#142843] dark:text-white">Project Categories</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Organize your projects with color-coded category labels.</p>
                  <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                </div>
                <div className="space-y-6">

                  {/* Add new */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Add New Category</h3>
                    <div className="flex items-center gap-3">
                      {/* Color swatch */}
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="w-11 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-[#1c304a]"
                          title="Pick a color"
                          suppressHydrationWarning
                        />
                      </div>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newCategory.trim()) { addCategory(newCategory); setNewCategory(""); }
                          }
                        }}
                        placeholder="e.g. Blockchain, AI/ML, DevOps…"
                        className={`flex-1 ${inputClass}`}
                        suppressHydrationWarning
                      />
                      <button
                        type="button"
                        onClick={() => { if (newCategory.trim()) { addCategory(newCategory); setNewCategory(""); } }}
                        className="inline-flex items-center gap-1.5 px-4 py-3 bg-[#0f2d5a] hover:bg-[#0c2447] text-white font-bold text-sm rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Press Enter or click Add to create the category.</p>
                  </div>

                  {/* Active categories */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Categories</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{categories.length} total</span>
                    </div>

                    {categories.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categories.map((cat: string, idx: number) => {
                          const catColors = ["#0052cc","#7c3aed","#059669","#dc2626","#d97706","#0891b2","#db2777","#475569"];
                          const color = catColors[idx % catColors.length];
                          return (
                            <div
                              key={cat}
                              className="group flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a] hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-black"
                                style={{ backgroundColor: color }}
                              >
                                {cat.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate block">{cat}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                  <span className="text-[10px] text-slate-400" style={{ color }}>{color}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCategory(cat)}
                                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
                                title={`Remove ${cat}`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-sm">
                          <Tags size={24} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No categories yet</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add your first category above to get started.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => document.querySelector<HTMLInputElement>('input[placeholder*="Blockchain"]')?.focus()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0052cc] hover:bg-[#003d99] text-white text-xs font-bold rounded-xl transition-all"
                        >
                          <Plus size={12} /> Create Category
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
          </div>
        </div>
      </div>

      {/* ── SAVE SUCCESS TOAST ── */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-4 rounded-2xl flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span className="font-semibold text-sm">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings saved successfully!
          </span>
        </div>
      )}
    </div>
  );
}
