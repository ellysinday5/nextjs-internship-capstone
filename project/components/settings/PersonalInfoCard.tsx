"use client";

import type React from "react";

interface PersonalInfoCardProps {
  fullName: string;
  email: string;
  role: string;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export function PersonalInfoCard({
  fullName,
  email,
  role,
  onFullNameChange,
  onEmailChange,
  onRoleChange,
}: PersonalInfoCardProps) {
  const inputClass =
    "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-[#1c304a] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-transparent transition-all placeholder:text-slate-400";

  return (
    <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#14263e] space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Update your public profile details and contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="pf-full-name"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Full Name
          </label>
          <input
            id="pf-full-name"
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="Your Name"
            className={inputClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="pf-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Email Address
          </label>
          <input
            id="pf-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="your@email.com"
            className={inputClass}
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label
            htmlFor="pf-role"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Role / Title
          </label>
          <input
            id="pf-role"
            type="text"
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            placeholder="e.g. Product Designer, Software Engineer"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
