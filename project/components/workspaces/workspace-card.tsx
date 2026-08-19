"use client";

import type { UserWorkspace } from "@/actions/member-actions";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  FolderKanban,
  Pencil,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import React from "react";

interface WorkspaceCardProps {
  workspace: UserWorkspace;
  onSwitch: (id: string) => void;
  onEdit?: (workspace: UserWorkspace) => void;
  onDelete?: (workspace: UserWorkspace) => void;
  isSwitching?: boolean;
}

export function WorkspaceCard({
  workspace,
  onSwitch,
  onEdit,
  onDelete,
  isSwitching = false,
}: WorkspaceCardProps) {
  const isOwner = workspace.role === "owner";
  const isAdmin = workspace.role === "admin";
  const isActive = workspace.isActive;
  const canManage = isOwner || isAdmin;

  const roleLabel = isOwner ? "Owner" : isAdmin ? "Admin" : "Member";
  const roleBg = isOwner
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    : isAdmin
      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
      : "bg-blue-500/10 text-blue-600 dark:text-blue-400";

  const RoleIcon = isOwner ? Crown : isAdmin ? Shield : UserCheck;

  return (
    <div
      onClick={() => !isActive && !isSwitching && onSwitch(workspace.id)}
      className={`group relative flex cursor-pointer select-none flex-col justify-between rounded-2xl border overflow-hidden transition-all duration-200 ${
        isActive
          ? "border-blue_munsell/50 bg-white dark:bg-outer_space shadow-xl"
          : "border-french_gray bg-white dark:bg-outer_space dark:border-payne's_gray hover:border-blue_munsell/50 hover:shadow-xl"
      }`}
    >
      {/* Accent top strip — blue for active, subtle for inactive */}
      <div
        className={`h-1.5 w-full shrink-0 transition-colors duration-200 ${
          isActive
            ? "bg-blue_munsell"
            : "bg-french_gray dark:bg-payne's_gray group-hover:bg-blue_munsell/60"
        }`}
      />

      <div className="p-6 flex flex-col flex-1 gap-0">
        {/* Header row: icon + name + role badge + actions */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon badge */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors ${
                isActive
                  ? "bg-blue_munsell text-white"
                  : "bg-blue-50 dark:bg-blue-950/40 text-blue_munsell group-hover:bg-blue_munsell group-hover:text-white"
              }`}
            >
              <Building2 size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-extrabold text-outer_space transition-colors group-hover:text-blue_munsell dark:text-white truncate">
                {workspace.name}
              </h3>
              {/* Role badge inline */}
              <span
                className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${roleBg}`}
              >
                <RoleIcon size={10} />
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Owner quick-actions — appear on hover */}
          {canManage && (
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(workspace);
                  }}
                  title="Rename"
                  className="rounded-lg p-1.5 text-payne's_gray opacity-0 transition-all hover:bg-platinum group-hover:opacity-100 dark:hover:bg-slate-800"
                >
                  <Pencil size={14} />
                </button>
              )}
              {onDelete && isOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(workspace);
                  }}
                  title="Delete"
                  className="rounded-lg p-1.5 text-payne's_gray opacity-0 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Slug */}
        <p className="mb-4 text-xs leading-relaxed text-payne's_gray truncate">/{workspace.slug}</p>

        <div className="mt-auto">
          {/* Footer meta */}
          <div className="flex items-center gap-3 border-t border-french_gray dark:border-payne's_gray pt-3 text-xs font-medium text-payne's_gray">
            <span className="flex items-center gap-1">
              <FolderKanban size={13} className="text-blue_munsell/70" />
              <strong className="font-bold text-outer_space dark:text-french_gray">
                {workspace.projectCount}
              </strong>{" "}
              {workspace.projectCount === 1 ? "project" : "projects"}
            </span>

            {workspace.memberCount > 0 && (
              <span className="flex items-center gap-1">
                <Users size={13} />
                {workspace.memberCount} {workspace.memberCount === 1 ? "member" : "members"}
              </span>
            )}

            {/* Active badge */}
            {isActive && (
              <span className="ml-auto flex items-center gap-1 font-bold text-blue_munsell">
                <CheckCircle2 size={13} />
                Active
              </span>
            )}
          </div>

          {/* Switch CTA (only when not active) */}
          {!isActive && (
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-payne's_gray opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-blue_munsell">
              {isSwitching ? "Switching..." : "Switch to this workspace"}
              <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
