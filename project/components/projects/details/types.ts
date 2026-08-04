import { TaskItem } from "@/components/tasks/task-details";

export type ProjectStatusType =
  | "On track"
  | "At risk"
  | "Off track"
  | "On hold"
  | "Complete"
  | "Dropped"
  | null;

export interface Section {
  id: string;
  title: string;
  tasks: TaskItem[];
}

export interface WidgetOption {
  id: string;
  title: string;
  description: string;
  type: "metric" | "chart" | "list";
}

export const STATUS_OPTIONS: { label: string; value: ProjectStatusType; colorClass: string; dotClass: string }[] = [
  {
    label: "No status",
    value: null,
    colorClass: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
    dotClass: "border border-slate-400 bg-transparent",
  },
  {
    label: "On track",
    value: "On track",
    colorClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
  },
  {
    label: "At risk",
    value: "At risk",
    colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    dotClass: "bg-amber-500",
  },
  {
    label: "Off track",
    value: "Off track",
    colorClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    dotClass: "bg-rose-500",
  },
  {
    label: "On hold",
    value: "On hold",
    colorClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    dotClass: "bg-blue-500",
  },
  {
    label: "Complete",
    value: "Complete",
    colorClass: "bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white",
    dotClass: "bg-white",
  },
  {
    label: "Dropped",
    value: "Dropped",
    colorClass: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dotClass: "bg-slate-500",
  },
];

export const COLOR_SWATCHES = [
  "#64748b", "#3b82f6", "#ef4444", "#f97316", "#eab308",
  "#84cc16", "#22c55e", "#06b6d4", "#6366f1", "#a855f7",
  "#ec4899", "#f43f5e", "#14b8a6", "#0f172a",
];
