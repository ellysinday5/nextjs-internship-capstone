"use client";

import type { ProjectWithStats } from "@/actions/project-actions";
import { type ProjectItem, toSlug } from "@/lib/project-data";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  MoreHorizontal,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

interface ProjectTableViewProps {
  projects: ProjectItem[];
  onEdit: (project: ProjectWithStats) => void;
  onDelete: (project: ProjectWithStats) => void;
}

const PAGE_SIZE = 8;

import { createPortal } from "react-dom";

function ActionMenu({
  project,
  onDelete,
}: {
  project: ProjectItem;
  onDelete: (project: ProjectWithStats) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 176;
      // Align menu to the right edge of the button
      const left = Math.max(12, rect.right - menuWidth);
      const top = rect.bottom + 6;
      setCoords({ top, left });
      setOpen(true);
    }
  };

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleScroll() {
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  return (
    <div className="relative flex justify-center items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="p-1.5 rounded-lg text-slate-400 hover:text-[#142843] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Actions"
        suppressHydrationWarning
      >
        <MoreHorizontal size={16} />
      </button>

      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="z-[9999] w-44 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                router.push(`/projects/${toSlug(project.name)}`);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              suppressHydrationWarning
            >
              <Eye size={14} className="text-[#00b4d8]" />
              View
            </button>
            {/* Edit */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                router.push(`/projects/${project.id}/edit`);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              suppressHydrationWarning
            >
              <Edit3 size={14} className="text-[#0052cc]" />
              Edit
            </button>
            {/* Delete */}
            <div className="border-t border-slate-100 dark:border-slate-700" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                const target: ProjectWithStats = project.dbProject || {
                  id: project.id,
                  name: project.name,
                  description: project.description || null,
                  ownerId: "demo",
                  ownerName: "Unknown",
                  dueDate: null,
                  techStack: project.techStack || [],
                  status: project.status,
                  priority: project.priority,
                  createdAt: null,
                  updatedAt: null,
                  listCount: 0,
                  taskCount: project.tasksCount || 0,
                  completedTaskCount: Math.round(
                    ((project.tasksCount || 0) * (project.progress || 0)) / 100,
                  ),
                  completionPercentage: project.progress || 0,
                  memberCount: project.members || 1,
                  members: [],
                };
                onDelete(target);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              suppressHydrationWarning
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function ProjectTableView({ projects, onEdit, onDelete }: ProjectTableViewProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const paged = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever the project list changes (e.g. filters applied)
  useEffect(() => {
    setPage(1);
  }, [projects.length]);

  return (
    <div className="flex flex-col gap-0">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paged.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => router.push(`/projects/${toSlug(project.name)}`)}
                  className="hover:bg-slate-50 dark:hover:bg-[#1c304a] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${project.color}`} />
                      <div className="min-w-0">
                        <p className="font-bold text-[#142843] dark:text-white truncate text-sm">
                          {project.name}
                        </p>
                        {project.isDb ? (
                          <span className="text-[10px] font-extrabold text-[#00b4d8]">
                            Database
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Workspace
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                        project.status === "In Progress"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : project.status === "Review"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                            : project.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        project.priority === "High"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : project.priority === "Medium"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {project.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#00b4d8] shrink-0" />
                      <span className="truncate">{project.owner || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-full">
                      {project.teamName || "General"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <ActionMenu project={project} onDelete={onDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 px-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Page <strong className="text-[#142843] dark:text-white">{page}</strong> of{" "}
            <strong className="text-[#142843] dark:text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              suppressHydrationWarning
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`min-w-[32px] h-8 rounded-xl text-xs font-bold transition-colors ${
                  p === page
                    ? "bg-[#142843] text-white shadow-sm"
                    : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                suppressHydrationWarning
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              suppressHydrationWarning
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
