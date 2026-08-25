"use client";

import { RuntimeErrorIllustration } from "@/components/errors/error-illustrations";
import { useEffect } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────────────────────
   app/(dashboard)/error.tsx — Dashboard-scoped client-side error boundary.

   Catches unhandled runtime errors thrown inside any page or layout within
   the (dashboard) route group. Because this is scoped inside the dashboard
   group layout, the sidebar and top navbar remain rendered — the user keeps
   their orientation and can navigate away without a full-page takeover.

   Logs the error to console.error for debugging before showing the friendly UI.
───────────────────────────────────────────────────────────────────────────── */

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log full error + stack for debugging — do not remove.
    console.error("[SyntraFlow] Dashboard runtime error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center bg-white dark:bg-[#0f1d31]">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-blue-500/10 dark:bg-[#0033a0]/15 blur-2xl scale-150 pointer-events-none" />
        <div className="relative">
          <RuntimeErrorIllustration className="w-32 h-32" />
        </div>
      </div>

      {/* Text */}
      <div className="max-w-sm space-y-3 mb-8">
        <p className="text-[#0033a0] dark:text-blue-400 text-xs font-mono font-bold tracking-[0.15em] uppercase">
          Something went wrong
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          This page hit an error
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          An unexpected error occurred. You can try again, or navigate to a different page. If this keeps happening, please contact support.
        </p>
        {/* Show digest code if available for support reference */}
        {error.digest && (
          <p className="text-slate-400 dark:text-slate-500 text-xs font-mono mt-2">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0033a0] hover:bg-[#002a80] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#0033a0]/20 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0033a0]"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
