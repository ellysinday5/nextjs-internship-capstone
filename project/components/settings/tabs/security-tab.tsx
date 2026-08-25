"use client";

import { useUser } from "@clerk/nextjs";
import { sileo } from "@/utils/alerts";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

interface SecurityTabProps {
  onSaved?: () => void;
}

export function SecurityTab({ onSaved }: SecurityTabProps) {
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const passwordRequirements = useMemo(() => {
    return [
      { id: "len", label: "At least 8 characters", valid: newPassword.length >= 8 },
      { id: "upper", label: "One uppercase letter", valid: /[A-Z]/.test(newPassword) },
      { id: "num", label: "One number", valid: /[0-9]/.test(newPassword) },
      { id: "spec", label: "One special character", valid: /[^A-Za-z0-9]/.test(newPassword) },
    ];
  }, [newPassword]);

  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    return passwordRequirements.filter((r) => r.valid).length;
  }, [newPassword, passwordRequirements]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength] || "";
  const strengthColor =
    ["", "bg-red-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"][passwordStrength] || "";
  const strengthText =
    ["", "text-red-500", "text-amber-500", "text-sky-500", "text-emerald-500"][passwordStrength] ||
    "";

  const [activeSessions, setActiveSessions] = useState([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "Manila, PH",
      time: "Active now",
      current: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "Quezon City, PH",
      time: "2 hours ago",
      current: false,
    },
    {
      id: "3",
      device: "Firefox on macOS",
      location: "Makati, PH",
      time: "Yesterday",
      current: false,
    },
  ]);

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      sileo.error("You must be logged in to update your password.", "Unauthorized");
      return;
    }
    if (!currentPassword) {
      sileo.error("Please provide your current password.", "Current Password Required");
      return;
    }
    if (passwordStrength < 2) {
      sileo.error(
        "Please choose a stronger new password (at least 8 characters, with letters and numbers).",
        "Weak Password",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      sileo.error("New password and confirm password do not match.", "Password Mismatch");
      return;
    }

    setIsUpdating(true);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      sileo.success("Your password has been changed securely.", "Password Changed");
      onSaved?.();
    } catch (err: any) {
      console.error("[SecurityTab] updatePassword error:", err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to update password. Please check your current password and try again.";
      sileo.error(msg, "Password Error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeSession = (id: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    sileo.success("Session terminated.", "Session Revoked");
  };

  const handleSignOutAllOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.current));
    sileo.success("All other active sessions have been signed out.", "Sessions Terminated");
  };

  const inputClass =
    "w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#1c304a] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:border-[#0052cc] transition-all shadow-xs";

  return (
    <form onSubmit={handlePasswordSave}>
      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#142843] dark:text-white">Security Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your password, active login sessions, and account credentials.
          </p>
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
              <label
                htmlFor="sec-current-pw"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="sec-current-pw"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label
                htmlFor="sec-new-pw"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="sec-new-pw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= passwordStrength ? strengthColor : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold ${strengthText}`}>
                    {strengthLabel} password
                  </p>
                  <ul className="mt-1.5 space-y-0.5">
                    {passwordRequirements.map(({ id, label, valid }) => (
                      <li
                        key={id}
                        className={`flex items-center gap-1.5 text-[10px] font-medium ${
                          valid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                        }`}
                      >
                        <CheckCircle2
                          size={10}
                          className={valid ? "text-emerald-500" : "text-slate-300"}
                        />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="sec-confirm-pw"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="sec-confirm-pw"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-red-400 focus:ring-red-400"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[10px] text-red-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={10} /> Passwords do not match
                </p>
              )}
              {confirmPassword && confirmPassword === newPassword && (
                <p className="text-[10px] text-emerald-500 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 size={10} /> Passwords match
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#142843] dark:text-white">
                Active Sessions
              </h3>
              <p className="text-[11px] text-slate-400">
                Devices currently signed in to your account
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOutAllOtherSessions}
              className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
            >
              Sign out all other devices
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSessions.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border ${
                  s.current
                    ? "border-[#0052cc]/20 bg-blue-50/50 dark:bg-blue-950/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c304a]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#142843] dark:text-white truncate">
                      {s.device}
                    </span>
                    {s.current && (
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full shrink-0">
                        This device
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {s.location} · {s.time}
                  </p>
                </div>
                {!s.current && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(s.id)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }}
          className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUpdating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f2d5a] hover:bg-[#0c2447] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          {isUpdating && <Loader2 size={13} className="animate-spin" />}
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
