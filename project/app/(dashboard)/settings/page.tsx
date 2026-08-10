"use client";

import { useState, useEffect, useRef } from "react";
import { User, Bell, Shield, Palette, CheckCircle2, Save, Camera, X, Tags } from "lucide-react";
import { useUserProfile } from "@/context/user-profile-context";
import { useCategories } from "@/context/category-context";
import Image from "next/image";

type SettingsTab = "profile" | "notification" | "security" | "appearance" | "categories";

export default function SettingsPage() {
  const { profile, updateProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { categories, addCategory, removeCategory } = useCategories();
  const [newCategory, setNewCategory] = useState("");


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

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
  ];

  const cancelBtn =
    "px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-[#142843] dark:text-white font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]";
  const saveBtn =
    "inline-flex items-center gap-2 px-5 py-2.5 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]";

  return (
    <div className="space-y-6 w-full">
      {saveSuccess && (
        <div className="bg-emerald-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={22} className="shrink-0" />
          <span className="font-bold text-sm">
            Your {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings have been saved
            successfully!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 xl:col-span-3 bg-[#e8f1ff] dark:bg-[#20182b] border-2 border-[#142843] dark:border-purple-900/60 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl font-black text-[#142843] dark:text-white mb-5 tracking-tight">
            Settings
          </h2>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-extrabold rounded-xl transition-all duration-200 ${isActive
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

          {activeTab === "profile" && (
            <div className="mt-6 p-4 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-[#142843]/15 dark:border-slate-600/40">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-purple-300/50 shadow-md">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile preview"
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white text-lg font-black">
                      {initials || "U"}
                    </div>
                  )}
                </div>
                <p className="text-xs font-black text-[#142843] dark:text-white truncate w-full">
                  {fullName}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full">
                  {email}
                </p>
                <span className="text-[10px] font-bold text-[#0052cc] dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">
                  {role}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-[#14263e] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#142843] dark:text-white tracking-tight">
                Profile Settings
              </h2>

              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-purple-200/60 dark:ring-purple-800/40 shadow-md">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile picture"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white text-2xl font-black">
                        {initials || "U"}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    aria-label="Change profile picture"
                    suppressHydrationWarning
                  >
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
                  { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword },
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
                        className={`py-3 px-4 rounded-xl border-2 font-bold text-sm capitalize transition-all hover:scale-[1.03] ${themeMode === mode
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
                      <div
                        key={cat}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {cat}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCategory(cat)}
                          className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title={`Remove ${cat}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-sm text-slate-500 italic">No categories available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
