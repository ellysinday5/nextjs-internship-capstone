"use client";

import React, { useState } from "react";
import {
  Plus,
  Target,
  Briefcase,
  Calendar,
  MoreHorizontal,
  Shield,
  Users,
  X,
  Crown,
} from "lucide-react";
import { ProjectStatusType, STATUS_OPTIONS } from "./types";
import { removeProjectMemberAction } from "@/actions/member-actions";
import { sileo } from "@/utils/alerts";

interface Member {
  id: string;
  name: string;
  role: string;
}

interface OverviewTabProps {
  status: ProjectStatusType;
  setStatus: (status: ProjectStatusType) => void;
  description: string;
  setDescription: (desc: string) => void;
  ownerName: string;
  ownerInitials: string;
  projectId?: string;
  members?: Member[];
  currentUserRole?: "Project Manager" | "Member";
  onAddMember?: () => void;
  onMembersChanged?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-amber-400 text-amber-950",
  "bg-blue-400 text-blue-950",
  "bg-emerald-400 text-emerald-950",
  "bg-purple-400 text-purple-950",
  "bg-rose-400 text-rose-950",
  "bg-cyan-400 text-cyan-950",
];

export function OverviewTab({
  status,
  setStatus,
  description,
  setDescription,
  ownerName,
  ownerInitials,
  projectId,
  members = [],
  currentUserRole = "Project Manager",
  onAddMember,
  onMembersChanged,
}: OverviewTabProps) {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isManager = currentUserRole === "Project Manager";

  async function handleRemoveMember(member: Member) {
    if (!projectId) return;
    setRemovingId(member.id);
    const res = await removeProjectMemberAction(member.id, projectId);
    setRemovingId(null);
    if (res.success) {
      sileo.success(`${member.name} removed from project.`, "Member Removed");
      onMembersChanged?.();
    } else {
      sileo.error(res.error || "Failed to remove member.", "Error");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
      {/* Left Main Content */}
      <div className="lg:col-span-8 p-6 space-y-8 overflow-y-auto">
        {/* Project description */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Project description
          </h2>
          {isEditingDesc ? (
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setIsEditingDesc(false)}
              placeholder="What's this project about?"
              className="w-full rounded-xl border border-blue-500 bg-white p-3 text-xs text-slate-800 outline-none dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400"
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingDesc(true)}
              className="group cursor-pointer rounded-xl border border-transparent p-3 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description || "What's this project about?"}
              </p>
            </div>
          )}
        </div>

        {/* Project roles / members */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Project roles
            </h2>
            {isManager && (
              <button
                onClick={onAddMember}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0033a0]/40 bg-[#0033a0]/5 px-3 py-1.5 text-xs font-semibold text-[#0033a0] transition-colors hover:bg-[#0033a0]/10 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40"
              >
                <Plus size={13} />
                Add Member
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Owner card */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 min-w-[180px]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 font-bold text-xs text-amber-950">
                {ownerInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {ownerName}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                  <Crown size={10} />
                  Project Owner
                </div>
              </div>
            </div>

            {/* Member cards */}
            {members.map((member, idx) => {
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isProjectManager = member.role === "Project Manager";
              return (
                <div
                  key={member.id}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 min-w-[180px] relative"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs ${avatarColor}`}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {member.name}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-[11px] font-semibold ${
                        isProjectManager
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isProjectManager ? (
                        <Shield size={10} />
                      ) : (
                        <Users size={10} />
                      )}
                      {member.role}
                    </div>
                  </div>

                  {/* Remove button — only visible to managers */}
                  {isManager && (
                    <button
                      onClick={() => handleRemoveMember(member)}
                      disabled={removingId === member.id}
                      className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-950/60 dark:text-red-400 transition-colors"
                      title={`Remove ${member.name}`}
                    >
                      {removingId === member.id ? (
                        <span className="h-2 w-2 rounded-full border border-red-400 border-t-transparent animate-spin" />
                      ) : (
                        <X size={10} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add member button (shown when no members yet and user is manager) */}
            {isManager && members.length === 0 && (
              <button
                onClick={onAddMember}
                className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 transition-colors min-w-[160px]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 dark:border-slate-600">
                  <Plus size={14} />
                </div>
                Add first member
              </button>
            )}
          </div>
        </div>

        {/* Connected goals */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Connected goals
          </h2>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <p className="text-xs text-slate-500 max-w-sm">
              Connect or create a goal to link this project to a larger purpose.
            </p>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
              <Target size={14} /> Add goal
            </button>
          </div>
        </div>

        {/* Connected portfolios */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Connected portfolios
          </h2>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <p className="text-xs text-slate-500 max-w-sm">
              Connect a portfolio to link this project to a larger portfolio view.
            </p>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
              <Briefcase size={14} /> Add portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-4 border-l border-slate-200/80 bg-slate-50/50 p-6 space-y-6 dark:border-slate-800 dark:bg-[#0f1d31]/50 overflow-y-auto">
        {/* Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              What's the status?
            </h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_OPTIONS.slice(0, 3).map((st) => (
              <button
                key={st.label}
                onClick={() => setStatus(st.value)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  status === st.value
                    ? `${st.colorClass} ring-2 ring-blue-500/50`
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${st.dotClass}`} />
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar size={15} />
          <span>No due date</span>
        </div>

        {/* Role legend */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Role Permissions</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Shield size={12} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Project Manager</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Full access — add/remove members, manage all tasks, configure project
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users size={12} className="text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Member</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Add tasks, edit/delete tasks, reply to comments, message teammates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 relative pl-2 border-l border-dashed border-slate-300 dark:border-slate-700">
            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                You joined
              </div>
              <div className="text-[11px] text-slate-400">15 days ago</div>
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-amber-950">
                {ownerInitials}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 relative pl-2 border-l border-dashed border-slate-300 dark:border-slate-700">
            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Project created
              </div>
              <div className="text-[11px] text-slate-400">
                {ownerName} • 15 days ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
