"use client";

import Link from "next/link";
import { FolderX } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   ProjectNotFoundError — rendered INSIDE the dashboard shell (sidebar + navbar
   remain visible) when a project slug or ID lookup returns nothing.

   Used by:
   - app/(dashboard)/projects/[id]/page.tsx   (client component, useEffect fetch)
   - app/(dashboard)/team/[projectSlug]/not-found.tsx (via notFound() on server)

   Design: centers within the content area (flex-1 column), NOT full-screen,
   so the surrounding dashboard chrome remains usable for navigation.
───────────────────────────────────────────────────────────────────────────── */

interface ProjectNotFoundErrorProps {
  /** Back link destination — defaults to /projects */
  backHref?: string;
  /** Back link label — defaults to "Back to Projects" */
  backLabel?: string;
  /** Custom heading */
  heading?: string;
  /** Custom description */
  description?: string;
}

export function ProjectNotFoundError({
  backHref = "/projects",
  backLabel = "Back to Projects",
  heading = "Project not found",
  description = "This project doesn't exist, was deleted, or you no longer have access to it. If you think this is a mistake, ask a project admin to re-invite you.",
}: ProjectNotFoundErrorProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        {/* Ambient ring */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 dark:bg-[#0033a0]/20 blur-2xl scale-150 pointer-events-none" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0f2347] dark:to-[#142843] flex items-center justify-center shadow-inner border border-blue-100 dark:border-[#0033a0]/30">
          <FolderX
            size={40}
            className="text-[#0033a0] dark:text-blue-400"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Text content */}
      <div className="max-w-sm space-y-3 mb-8">
        <p className="text-[#0033a0] dark:text-blue-400 text-xs font-mono font-bold tracking-[0.15em] uppercase">
          404 · Not Found
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {heading}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0033a0] hover:bg-[#002a80] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#0033a0]/20 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0033a0]"
        >
          ← {backLabel}
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
