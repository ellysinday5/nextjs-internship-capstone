"use client";

import { useState, useEffect, useRef } from "react";
import { User, Bell, Shield, Palette, CheckCircle2, Save, Camera, X, Tags, Sun, Moon, Monitor } from "lucide-react";
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
    "px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors";
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
          <div className="lg:col-span-9 bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">

            {/* PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave}>
                <div className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#142843] dark:text-white">Profile Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Update your personal information and profile picture.</p>
                    <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 mb-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-slate-100 dark:ring-slate-700 shadow">
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
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-[#142843] dark:text-slate-200">Profile Picture</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG or GIF · Max 5 MB</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0052cc] hover:bg-[#003d99] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                          suppressHydrationWarning
                        >
                          <Camera size={13} /> Upload Photo
                        </button>
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all"
                            suppressHydrationWarning
                          >
                            <X size={13} /> Remove
                          </button>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} suppressHydrationWarning />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} suppressHydrationWarning />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Role</label>
                      <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} suppressHydrationWarning />
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { setFullName(profile.fullName); setEmail(profile.email); setRole(profile.role); setAvatarPreview(profile.avatarUrl); }} className={cancelBtn} suppressHydrationWarning>Cancel</button>
                  <button type="submit" className={saveBtn} suppressHydrationWarning><Save size={15} /> Save Changes</button>
                </div>
              </form>
            )}

            {/* NOTIFICATION */}
            {activeTab === "notification" && (
              <form onSubmit={handleSave}>
                <div className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#142843] dark:text-white">Notification Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Control how and when you receive notifications.</p>
                    <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Email Notifications", desc: "Receive project updates, comments, and task deadlines via email", checked: emailNotifs, set: setEmailNotifs },
                      { label: "Push Notifications", desc: "Get real-time browser notifications for urgent activity", checked: pushNotifs, set: setPushNotifs },
                      { label: "Task Assignment Alerts", desc: "Notify instantly when you are assigned to a task or project", checked: taskAlerts, set: setTaskAlerts },
                      { label: "Weekly Summary Digest", desc: "Receive a weekly productivity report every Monday morning", checked: weeklyDigest, set: setWeeklyDigest },
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
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { setEmailNotifs(true); setPushNotifs(true); setTaskAlerts(true); setWeeklyDigest(false); }} className={cancelBtn} suppressHydrationWarning>Cancel</button>
                  <button type="submit" className={saveBtn} suppressHydrationWarning><Save size={15} /> Save Changes</button>
                </div>
              </form>
            )}

            {/* SECURITY */}
            {activeTab === "security" && (
              <form onSubmit={handleSave}>
                <div className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#142843] dark:text-white">Security Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Update your password and manage account security options.</p>
                    <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl mb-4">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Change Password</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Current Password", value: currentPassword, set: setCurrentPassword },
                        { label: "New Password", value: newPassword, set: setNewPassword },
                        { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword },
                      ].map(({ label, value, set }) => (
                        <div key={label}>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
                          <input type="password" value={value} onChange={(e) => set(e.target.value)} placeholder="••••••••" className={inputClass} suppressHydrationWarning />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-[#142843] dark:text-white text-sm">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add an extra layer of security using an authenticator app</p>
                    </div>
                    <ToggleSwitch checked={twoFactor} onChange={setTwoFactor} />
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setTwoFactor(false); }} className={cancelBtn} suppressHydrationWarning>Cancel</button>
                  <button type="submit" className={saveBtn} suppressHydrationWarning><Save size={15} /> Save Changes</button>
                </div>
              </form>
            )}

            {/* APPEARANCE */}
            {activeTab === "appearance" && (
              <form onSubmit={handleSave}>
                <div className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#142843] dark:text-white">Appearance Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Customize the look and feel of your workspace.</p>
                    <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Theme Preference</label>
                      <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map(({ mode, label, Icon }) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setThemeMode(mode)}
                            className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                              themeMode === mode
                                ? "border-[#0052cc] bg-[#0052cc]/10 dark:bg-[#0052cc]/20 text-[#0052cc] dark:text-sky-400"
                                : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                            }`}
                            suppressHydrationWarning
                          >
                            <Icon size={20} />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-[#142843] dark:text-white text-sm">Compact Sidebar</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Minimize sidebar by default to maximize your workspace screen size</p>
                      </div>
                      <ToggleSwitch checked={compactMode} onChange={setCompactMode} />
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { setThemeMode("light"); setCompactMode(false); }} className={cancelBtn} suppressHydrationWarning>Cancel</button>
                  <button type="submit" className={saveBtn} suppressHydrationWarning><Save size={15} /> Save Changes</button>
                </div>
              </form>
            )}

            {/* CATEGORIES */}
            {activeTab === "categories" && (
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#142843] dark:text-white">Project Categories</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Organize your projects with custom category labels.</p>
                  <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Add New Category</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(newCategory); setNewCategory(""); } }}
                        placeholder="e.g. Blockchain"
                        className={`flex-1 ${inputClass}`}
                        suppressHydrationWarning
                      />
                      <button
                        type="button"
                        onClick={() => { addCategory(newCategory); setNewCategory(""); }}
                        className="px-5 py-3 bg-[#0f2d5a] hover:bg-[#0c2447] text-white font-bold text-sm rounded-xl shadow-sm transition-all whitespace-nowrap"
                      >
                        Add Category
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Active Categories</h3>
                    {categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {categories.map((cat: string) => (
                          <div key={cat} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                            <button type="button" onClick={() => removeCategory(cat)} className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title={`Remove ${cat}`}>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Tags size={22} className="text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No categories yet. Add one above to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
