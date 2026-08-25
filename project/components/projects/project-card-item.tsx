"use client";

import type { ProjectCardData } from "@/lib/project-card-types";
import { toSlug } from "@/lib/project-data";
import { PROJECT_ICON_LIST } from "@/lib/project-meta";
import { Calendar, Star, Users } from "lucide-react";
import { ListTodo } from "lucide-react";
import { useRouter } from "next/navigation";

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

export function ProjectCardItem({ project, isLoading }: ProjectCardItemProps) {
  const router = useRouter();

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
        {/* Header: icon + title + favorite */}
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

          {/* Favorite star badge */}
          {isFav && (
            <div className="flex items-center shrink-0">
              <span title="Favorite">
                <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />
              </span>
            </div>
          )}
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
        <table className="w-full text-sm text-left table-fixed">
          <thead className="bg-[#142843] text-white">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-100 w-[35%]">
                Project
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-100 w-[16%]">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-100 w-[14%]">
                Priority
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-100 w-[18%]">
                Owner
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-100 w-[17%]">
                Team
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-100 text-center w-[70px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#14263e]">
            {Array.from({ length: count }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700/60 shrink-0" />
                    <div className="space-y-1">
                      <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700/60" />
                      <div className="h-2.5 w-40 rounded bg-slate-200 dark:bg-slate-700/60" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700/60" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700/60" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-700/60" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700/60" />
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="mx-auto h-4 w-6 rounded bg-slate-200 dark:bg-slate-700/60" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
