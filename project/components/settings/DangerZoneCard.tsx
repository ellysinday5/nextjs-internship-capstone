"use client";

import { sileo } from "@/utils/alerts";
import { Trash2 } from "lucide-react";

export function DangerZoneCard() {
  const handleDeleteAccount = () => {
    sileo.warning(
      "Please contact your workspace admin to proceed with account deletion.",
      "Admin Clearance",
    );
  };

  return (
    <div className="p-6 rounded-2xl border border-red-200/80 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Delete Account</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
            Permanently delete your account and all associated workspace data. This action cannot be
            undone.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-[#14263e] border border-red-200 dark:border-red-800/80 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0 cursor-pointer"
        >
          <Trash2 size={13} />
          Delete Account
        </button>
      </div>
    </div>
  );
}
