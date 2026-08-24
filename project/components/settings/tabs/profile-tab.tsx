"use client";

import { AccountStats } from "@/components/settings/AccountStats";
import { DangerZoneCard } from "@/components/settings/DangerZoneCard";
import { PersonalInfoCard } from "@/components/settings/PersonalInfoCard";
import { ProfilePictureCard } from "@/components/settings/ProfilePictureCard";
import { useUserProfile } from "@/context/user-profile-context";
import { sileo } from "@/utils/alerts";
import type React from "react";
import { useEffect, useState } from "react";

interface ProfileTabProps {
  onSaved?: () => void;
}

export function ProfileTab({ onSaved }: ProfileTabProps) {
  const { profile, updateProfile } = useUserProfile();

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

  const hasChanges =
    fullName !== profile.fullName ||
    email !== profile.email ||
    role !== profile.role ||
    avatarPreview !== profile.avatarUrl;

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

  const handleCancel = () => {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setRole(profile.role);
    setAvatarPreview(profile.avatarUrl);
    sileo.info("Unsaved changes discarded.", "Changes Reverted");
  };

  return (
    <form onSubmit={handleProfileSave} className="flex flex-col">
      <div className="p-6 sm:p-8 space-y-5">
        {/* Simple clean header */}
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your personal details, profile picture, and account credentials.
          </p>
        </div>

        {/* 1. Profile Picture Card */}
        <ProfilePictureCard
          avatarPreview={avatarPreview}
          fullName={fullName}
          role={role}
          email={email}
          onAvatarChange={setAvatarPreview}
        />

        {/* 2. Personal Information Card */}
        <PersonalInfoCard
          fullName={fullName}
          email={email}
          role={role}
          onFullNameChange={setFullName}
          onEmailChange={setEmail}
          onRoleChange={setRole}
        />

        {/* 3. Account Stats Card */}
        <AccountStats />

        {/* 4. Danger Zone Card */}
        <DangerZoneCard />
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-4 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-2xl">
        <button
          type="button"
          onClick={handleCancel}
          disabled={!hasChanges}
          className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-xs font-semibold text-white bg-[#0052cc] hover:bg-[#003d99] rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
