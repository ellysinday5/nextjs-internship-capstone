"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Users, Calendar, Pencil, Trash2 } from "lucide-react";
import { toSlug } from "@/lib/project-data";
import type { ProjectCardData } from "@/lib/project-card-types";

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

  function navigateToBoard() {
    router.push(`/projects/${toSlug(project.name)}`);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={navigateToBoard}
      onKeyDown={(e) => e.key === "Enter" && navigateToBoard()}
      className="group relative flex cursor-pointer select-none flex-col justify-between rounded-2xl border border-french_gray bg-white p-6 transition-all duration-200 hover:border-blue_munsell/50 hover:shadow-xl dark:bg-outer_space dark:border-payne's_gray"
    >
      {/* Header: title + actions menu */}
      <div>
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-base font-extrabold text-outer_space transition-colors group-hover:text-blue_munsell dark:text-white">
            {project.name}
          </h3>

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

        {/* Description */}
        {project.description && (
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-payne's_gray">
            {project.description}
          </p>
        )}
      </div>

      <div>
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
              className="h-full rounded-full bg-blue_munsell transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between border-t border-french_gray pt-3 text-xs font-medium text-payne's_gray">
          <div className="flex items-center gap-3">
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
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLES[project.status]}`}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-french_gray bg-white p-6 dark:bg-outer_space">
      <div className="mb-3 h-4 w-2/3 rounded bg-platinum" />
      <div className="mb-6 h-3 w-full rounded bg-platinum" />
      <div className="mb-4 h-1.5 w-full rounded-full bg-platinum" />
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded bg-platinum" />
        <div className="h-3 w-12 rounded bg-platinum" />
      </div>
    </div>
  );
}