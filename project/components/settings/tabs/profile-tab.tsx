"use client";

import { useUserProfile } from "@/context/user-profile-context";
import { sileo } from "@/utils/alerts";
import { AtSign, Camera, CheckCircle2, Clock, Hash, Trash2, User, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ProfileTabProps {
  onSaved?: () => void;
}

export function ProfileTab({ onSaved }: ProfileTabProps) {
  const { profile, updateProfile } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const initials = (fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      sileo.error("Image file size must be under 5MB.", "File Too Large");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
      sileo.success("Photo preview updated. Click 'Save Changes' to apply.", "Photo Selected");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
    sileo.info("Profile photo removed.", "Photo Cleared");
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      email,
      role,
      avatarUrl: avatarPreview,
    });
    sileo.success("Profile changes saved successfully.", "Profile Updated");
    onSaved?.();
  };

  const inputClass =
    "w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#1c304a] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-[#0052cc] transition-all shadow-xs";

  return (
    <form onSubmit={handleProfileSave}>
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#142843] dark:text-white">Profile Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Update your personal information and profile picture.
          </p>
          <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
        </div>

        {/* Avatar + stats strip */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 p-5 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/40 dark:to-blue-950/10 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-700 shadow-md">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Profile picture"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#0f2d5a] to-[#0052cc] flex items-center justify-center text-white text-2xl font-black">
                  {initials}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              aria-label="Change profile picture"
            >
              <Camera size={22} />
            </button>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
              <CheckCircle2 size={12} className="text-white" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <p className="text-base font-extrabold text-[#142843] dark:text-white">
                {fullName || "Your Name"}
              </p>
              <span className="inline-flex self-center text-[10px] font-bold text-[#0052cc] dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2.5 py-0.5 rounded-full">
                {role || "Member"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Member since Aug 2026
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0052cc] hover:bg-[#003d99] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Camera size={12} /> Change Photo
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <X size={12} /> Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">JPG, PNG or GIF · Max 5 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Quick stats strip */}
          <div className="flex sm:flex-col gap-4 sm:gap-3 shrink-0 text-center">
            {[
              { label: "Projects", value: "12" },
              { label: "Tasks Done", value: "84" },
              { label: "Teams", value: "3" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-lg font-extrabold text-[#142843] dark:text-white leading-none">
                  {value}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal info fields */}
        <div className="mb-6">
          <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="pf-full-name"
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"
              >
                <User size={11} /> Full Name
              </label>
              <input
                id="pf-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label
                htmlFor="pf-email"
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"
              >
                <AtSign size={11} /> Email
              </label>
              <input
                id="pf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="pf-role"
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"
              >
                <Hash size={11} /> Role / Title
              </label>
              <input
                id="pf-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Delete Account</h4>
              <p className="text-xs text-red-500/80 dark:text-red-400/60 mt-0.5">
                Permanently delete your account and all associated workspace data. This cannot be
                undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                sileo.warning(
                  "Please contact your workspace admin to proceed with account deletion.",
                  "Admin Clearance",
                )
              }
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0 cursor-pointer"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setFullName(profile.fullName);
            setEmail(profile.email);
            setRole(profile.role);
            setAvatarPreview(profile.avatarUrl);
          }}
          className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f2d5a] hover:bg-[#0c2447] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
