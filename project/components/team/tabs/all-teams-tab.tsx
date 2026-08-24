"use client";

import { toSlug } from "@/lib/project-data";
import { ArrowRight, FolderKanban, Plus, Search, Users, X } from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo } from "react";

export interface TeamProjectOption {
  id: string;
  name: string;
  ownerName: string;
  description: string | null;
  memberCount?: number;
}

interface AllTeamsTabProps {
  projects?: TeamProjectOption[];
  onCreateTeam?: () => void;
}

export function AllTeamsTab({ projects = [], onCreateTeam }: AllTeamsTabProps) {
  const [search, setSearch] = useState("");

  const projectList = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      slug: toSlug(p.name),
    }));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projectList;
    const q = search.toLowerCase();
    return projectList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q),
    );
  }, [projectList, search]);

  if (projectList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 dark:border-slate-800 dark:bg-slate-900/40 px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0033a0] dark:bg-blue-950/40 dark:text-blue-400">
          <FolderKanban size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">No project teams yet</h2>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Projects in your workspace will appear here as dedicated teams.
        </p>
        <Link
          href="/projects/create"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0033a0] hover:bg-[#00277a] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all"
        >
          <Plus size={16} />
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project teams..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033a0]/30 focus:border-[#0033a0] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-slate-400">
          {filtered.length} / {projectList.length} {projectList.length === 1 ? "team" : "teams"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/40 py-12 text-center">
          <p className="text-sm font-medium text-slate-500">No teams match your search.</p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-2 text-xs font-bold text-[#0033a0] hover:underline dark:text-blue-400"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((proj) => (
            <Link
              key={proj.id}
              href={`/team/${proj.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#0033a0]/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0033a0] transition-transform group-hover:scale-105 dark:bg-blue-950/50 dark:text-blue-400">
                    <FolderKanban size={20} />
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {proj.ownerName || "Project"}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0033a0] dark:group-hover:text-blue-400 transition-colors">
                  {proj.name}
                </h3>
                {proj.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {proj.description}
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs font-semibold text-[#0033a0] dark:text-blue-400">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Users size={14} />
                  Manage Team
                </span>
                <span className="flex items-center gap-1 transition-transform group-hover:translate-x-1">
                  View <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
