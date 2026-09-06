import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  /** Display label shown in the top-left (e.g. "Active Projects") */
  label: string;
  /** Numeric or string value displayed large in the bottom-left */
  value: number | string;
  /** Lucide icon rendered inside the pill badge top-right */
  icon: LucideIcon;
  /** Hex color for the 4px top-border accent strip (e.g. "#0033a0") */
  accentColor: string;
  /** Tailwind text-color class(es) for the large value (e.g. "text-[#0033a0] dark:text-blue-400") */
  color: string;
  /** Tailwind bg + text classes for the icon pill badge (e.g. "bg-blue-50 text-[#0033a0] dark:bg-blue-950/60 dark:text-blue-400") */
  pillBg: string;
}

/**
 * Shared stat card used by both the Dashboard and Calendar pages.
 * Renders a card with:
 *  - 4px colored top-border accent strip
 *  - label (top-left) + icon badge (top-right)
 *  - large numeric value (bottom-left)
 *
 * Extracted from the Calendar page stat card pattern so both pages
 * stay visually in sync via a single implementation.
 */
export function StatCard({ label, value, icon: Icon, accentColor, color, pillBg }: StatCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden">
      {/* Colored top-border accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 w-full"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div
          className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${pillBg}`}
        >
          <Icon size={16} className="stroke-[2.5]" />
        </div>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
