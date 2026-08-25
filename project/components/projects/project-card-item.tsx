"use client";

import type { ProjectCardData } from "@/lib/project-card-types";
import { toSlug } from "@/lib/project-data";
import { PROJECT_ICON_LIST } from "@/lib/project-meta";
import { Calendar, MoreVertical, Pencil, Star, Trash2, Users } from "lucide-react";
import { ListTodo } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectCardItemProps {
  project: ProjectCardData;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const STATUS_STYLES: Record<ProjectCardData["status"], string> = {
  active: "bg-blue_munsell/10 text-blue_munsell",
  completed: "bg-emerald-500/10 text-emerald-600",
  "on-hold": "bg-amber-500/10 text-amber-600",
};

const STATUS_LABELS: Record<ProjectCardData["status"], string> = {
  active: "Active",
  completed: "Completed",
  "on-hold": "On Hold",
};

export function ProjectCardItem({ project, onEdit, onDelete, isLoading }: ProjectCardItemProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (isLoading) {
    return <ProjectCardSkeleton />;
  }

  const accentColor = project.accentColor ?? "#3b82f6";
  const IconComp = PROJECT_ICON_LIST[project.iconIndex ?? 0]?.Icon ?? ListTodo;
  const isFav = project.isFavorite ?? false;

  function navigateToBoard() {
    router.push(`/projects/${toSlug(project.name)}`);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={navigateToBoard}
      onKeyDown={(e) => e.key === "Enter" && navigateToBoard()}
      className="group relative flex cursor-pointer select-none flex-col justify-between rounded-2xl border border-french_gray bg-white overflow-hidden transition-all duration-200 hover:border-blue_munsell/50 hover:shadow-xl dark:bg-outer_space dark:border-payne's_gray"
    >
      {/* Colored top accent strip */}
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: accentColor }} />

      <div className="p-6 flex flex-col flex-1 gap-0">
        {/* Header: icon + title + favorite + actions menu */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Colored icon badge */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <IconComp size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-extrabold text-outer_space transition-colors group-hover:text-blue_munsell dark:text-white truncate">
                {project.name}
              </h3>
              {/* Status badge inline below name */}
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[project.status]}`}
              >
                {STATUS_LABELS[project.status]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Favorite star badge */}
            {isFav && (
              <span title="Favorite">
                <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />
              </span>
            )}

            {/* Actions kebab */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="rounded-lg p-1.5 text-payne's_gray opacity-0 transition-all hover:bg-platinum group-hover:opacity-100"
                aria-label="Project actions"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-french_gray bg-white py-1 shadow-lg dark:bg-outer_space"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.(project.id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-outer_space hover:bg-platinum dark:text-white"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.(project.id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-payne's_gray">
            {project.description}
          </p>
        )}

        <div className="mt-auto">
          {/* Progress */}
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
              <span className="text-payne's_gray">Completion</span>
              <span className="font-bold text-outer_space dark:text-french_gray">
                {project.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-platinum">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${project.progress}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>

          {/* Footer meta */}
          <div className="flex items-center gap-3 border-t border-french_gray pt-3 text-xs font-medium text-payne's_gray">
            <span className="flex items-center gap-1">
              <Users size={13} />
              {project.memberCount}
            </span>
            {project.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {formatDueDate(project.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-french_gray bg-white overflow-hidden dark:bg-outer_space dark:border-slate-800 flex flex-col justify-between min-h-[220px]">
      {/* Accent strip */}
      <div className="h-1.5 w-full bg-platinum dark:bg-slate-700/60 shrink-0" />
      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Icon + title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-xl bg-platinum dark:bg-slate-700/60 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-2/3 rounded bg-platinum dark:bg-slate-700/60" />
              <div className="h-3 w-1/3 rounded-full bg-platinum dark:bg-slate-700/60" />
            </div>
          </div>
        </div>
        {/* Description */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-platinum dark:bg-slate-700/60" />
          <div className="h-3 w-4/5 rounded bg-platinum dark:bg-slate-700/60" />
        </div>
        {/* Progress */}
        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-16 rounded bg-platinum dark:bg-slate-700/60" />
            <div className="h-3 w-8 rounded bg-platinum dark:bg-slate-700/60" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-platinum dark:bg-slate-700/60" />
        </div>
        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-french_gray dark:border-slate-800 pt-3">
          <div className="h-3 w-12 rounded bg-platinum dark:bg-slate-700/60" />
          <div className="h-3 w-16 rounded bg-platinum dark:bg-slate-700/60" />
        </div>
      </div>
    </div>
  );
}

export function ProjectTableSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-[#14263e]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#142843] text-white">
            <tr>
              {[
                "Project",
                "Category",
                "Status",
                "Priority",
                "Owner",
                "Team",
                "Progress",
                "Devs",
                "Tasks",
                "Updated",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-100 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#14263e]">
            {Array.from({ length: count }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700/60 shrink-0" />
                    <div className="space-y-1">
                      <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700/60" />
                      <div className="h-2.5 w-40 rounded bg-slate-200 dark:bg-slate-700/60" />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700/60" /></td>
                <td className="px-5 py-4"><div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700/60" /></td>
                <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700/60" /></td>
                <td className="px-5 py-4"><div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700/60" /></td>
                <td className="px-5 py-4"><div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700/60" /></td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700/60" />
                    <div className="h-1.5 w-20 rounded-full bg-slate-200 dark:bg-slate-700/60" />
                  </div>
                </td>
                <td className="px-5 py-4"><div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700/60" /></td>
                <td className="px-5 py-4"><div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700/60" /></td>
                <td className="px-5 py-4"><div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700/60" /></td>
                <td className="px-5 py-4 text-center"><div className="mx-auto h-4 w-6 rounded bg-slate-200 dark:bg-slate-700/60" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
