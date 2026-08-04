"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit3, Trash2, Users, ClipboardList, User, Shield } from "lucide-react";
import { ProjectItem, toSlug } from "@/lib/project-data";
import { ProjectWithStats } from "@/app/actions/project-actions";

interface ProjectCardItemProps {
  project: ProjectItem;
  onEdit: (project: ProjectWithStats) => void;
  onDelete: (project: ProjectWithStats) => void;
  /** For local (non-DB) cards — opens the rich edit card modal */
  onEditLocal?: (project: ProjectItem) => void;
}

export function ProjectCardItem({ project, onEdit, onDelete, onEditLocal }: ProjectCardItemProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/projects/${toSlug(project.name)}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/projects/${toSlug(project.name)}`)}
      className="group relative bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:border-[#00b4d8]/50 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none"
    >
      <div>
        {/* Top Bar: Category, Priority & Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${project.color}`} />
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {project.category}
            </span>
            {project.isDb && (
              <span className="text-[10px] font-extrabold text-[#00b4d8] bg-[#e8f8fd] dark:bg-[#00b4d8]/20 px-2 py-0.5 rounded-full">
                Database
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                project.priority === "High"
                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  : project.priority === "Medium"
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
              }`}
            >
              {project.priority} Prio
            </span>

            {/* Edit button — routes to the dedicated Edit Project page */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/projects/${project.id}/edit`);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-[#00b4d8] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Edit project"
              aria-label="Edit project"
              suppressHydrationWarning
            >
              <Edit3 size={15} />
            </button>

            {/* Delete button — only for DB projects */}
            {project.isDb && project.dbProject && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.dbProject!);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                title="Delete project"
                aria-label="Delete project"
                suppressHydrationWarning
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-[#142843] dark:text-white group-hover:text-[#00b4d8] transition-colors mb-1.5">
          {project.name}
        </h3>

        {/* Owner & Team */}
        <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-[#00b4d8]">
            <User size={12} /> {project.owner || "Unassigned"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            <Shield size={11} className="text-slate-400" /> {project.teamName || "General"}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Completion</span>
            <span className="text-[#142843] dark:text-slate-200 font-bold">
              {project.progress}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${project.color}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users size={13} className="text-slate-400" />
              {project.members} dev
            </span>
            <span className="flex items-center gap-1">
              <ClipboardList size={13} className="text-slate-400" />
              {project.tasksCount} tasks
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
              project.status === "In Progress"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : project.status === "Review"
                ? "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                : project.status === "Completed"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : project.status === "On Hold"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>
    </div>
  );
}
