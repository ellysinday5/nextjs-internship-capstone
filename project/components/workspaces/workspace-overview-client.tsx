"use client";

import type { WorkspaceOverview } from "@/actions/member-actions";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  ExternalLink,
  FolderKanban,
  Mail,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  overview: WorkspaceOverview;
}

const STATUS_COLOR: Record<string, string> = {
  "Active": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "On Hold": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Completed": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Cancelled": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Planning": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const PRIORITY_COLOR: Record<string, string> = {
  "High": "text-red-500",
  "Medium": "text-amber-500",
  "Low": "text-emerald-500",
};

function RoleIcon({ role }: { role: string }) {
  if (role === "owner") return <Crown size={13} className="text-amber-500" />;
  if (role === "admin") return <Shield size={13} className="text-purple-500" />;
  return <UserCheck size={13} className="text-blue-500" />;
}

function RoleBadge({ role }: { role: string }) {
  const styles =
    role === "owner"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : role === "admin"
        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${styles}`}>
      <RoleIcon role={role} />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkspaceOverviewClient({ overview }: Props) {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f0f4f8] dark:bg-[#0b1728] text-slate-800 dark:text-slate-100">
      {/* ─── Hero / Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0033a0] via-[#1a4cb5] to-[#0d2f8a] px-6 py-10 sm:px-10">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full border-2 border-white" />
        </div>

        <div className="relative">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-blue-200 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Workspaces
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Icon */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
              <Building2 size={28} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{overview.name}</h1>
                <RoleBadge role={overview.userRole} />
              </div>
              <p className="text-sm text-blue-200 mb-3">/{overview.slug}</p>

              <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {overview.members.length} {overview.members.length === 1 ? "member" : "members"}
                </span>
                <span className="flex items-center gap-1.5">
                  <FolderKanban size={14} />
                  {overview.projects.length} {overview.projects.length === 1 ? "project" : "projects"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Created {formatDate(overview.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">

        {/* ── Projects ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderKanban size={18} className="text-[#0033a0]" />
              Projects
              <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {overview.projects.length}
              </span>
            </h2>
          </div>

          {overview.projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f1f35] p-10 text-center">
              <FolderKanban size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No projects yet in this workspace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {overview.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0f1f35] p-5 shadow-sm hover:shadow-lg hover:border-[#0033a0]/40 dark:hover:border-blue-500/40 transition-all duration-200"
                >
                  {/* Top accent */}
                  <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#0033a0] to-[#1a4cb5] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0033a0] group-hover:bg-[#0033a0] group-hover:text-white transition-colors">
                      <FolderKanban size={16} />
                    </div>
                    <ExternalLink size={14} className="shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-1 group-hover:text-[#0033a0] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        STATUS_COLOR[project.status] ?? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <CheckCircle2 size={10} />
                      {project.status}
                    </span>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {project.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(project.dueDate)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {project.memberCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Members ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-[#0033a0]" />
              Members
              <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {overview.members.length}
              </span>
            </h2>
          </div>

          {overview.members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f1f35] p-10 text-center">
              <Users size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No members yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0f1f35] overflow-hidden shadow-sm">
              {/* Desktop table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60">
                <span>Member</span>
                <span>Role</span>
                <span>Joined</span>
              </div>

              <ul className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {overview.members.map((member) => (
                  <li key={member.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-4 px-6 py-4 items-start sm:items-center hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                    {/* Name + email */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0033a0] to-[#1a4cb5] text-white text-sm font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {member.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                          <Mail size={10} />
                          {member.email}
                        </div>
                      </div>
                    </div>

                    {/* Role badge */}
                    <div className="mt-2 sm:mt-0">
                      <RoleBadge role={member.role} />
                    </div>

                    {/* Joined date */}
                    <div className="mt-1 sm:mt-0 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {member.role === "owner" ? "Workspace creator" : formatDate(member.joinedAt)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
