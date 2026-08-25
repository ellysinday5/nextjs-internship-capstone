"use client";

import {
  EditableProjectData,
  MEMBER_ROLES,
  type MemberRole,
  SUGGESTED_DEVS,
  type TeamMember,
} from "@/lib/project-edit-types";
import { UserAvatar } from "@/components/ui/user-avatar";
import { sileo } from "@/utils/alerts";
import {
  Check,
  ChevronDown,
  ClipboardList,
  GripVertical,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface MembersPanelProps {
  members: TeamMember[];
  setMembers: (members: TeamMember[]) => void;
  projectName: string;
}

const AVATAR_COLORS = [
  "bg-amber-400 text-amber-900",
  "bg-blue-500 text-white",
  "bg-emerald-500 text-white",
  "bg-purple-500 text-white",
  "bg-rose-500 text-white",
  "bg-sky-500 text-white",
];

export function MembersPanel({ members, setMembers, projectName }: MembersPanelProps) {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  const addMember = (dev: (typeof SUGGESTED_DEVS)[0]) => {
    if (members.some((m) => m.id === dev.id)) {
      sileo.info(`${dev.name} is already on this project`, "Already Added");
      return;
    }
    const newMember: TeamMember = {
      ...dev,
      role: "Frontend Dev",
      assignedTasks: [],
    };
    setMembers([...members, newMember]);
    setShowAddPanel(false);
    sileo.success(`Added ${dev.name} to ${projectName}`, "Member Added");
  };

  const removeMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setMembers(members.filter((m) => m.id !== memberId));
    if (member) sileo.info(`Removed ${member.name}`, "Member Removed");
  };

  const updateRole = (memberId: string, role: MemberRole) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, role } : m)));
  };

  const addTask = (memberId: string) => {
    const taskTitle = newTaskInputs[memberId]?.trim();
    if (!taskTitle) return;
    setMembers(
      members.map((m) =>
        m.id === memberId ? { ...m, assignedTasks: [...m.assignedTasks, taskTitle] } : m,
      ),
    );
    setNewTaskInputs((prev) => ({ ...prev, [memberId]: "" }));
    sileo.success(`Task assigned!`, "Task Assigned");
  };

  const removeTask = (memberId: string, taskIdx: number) => {
    setMembers(
      members.map((m) =>
        m.id === memberId
          ? { ...m, assignedTasks: m.assignedTasks.filter((_, i) => i !== taskIdx) }
          : m,
      ),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Team Members ({members.length})
        </span>
        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-2 py-1 rounded-lg transition-colors"
        >
          <UserPlus size={13} /> Add Member
        </button>
      </div>

      {/* Add member picker */}
      {showAddPanel && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
            Select a team member to add:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_DEVS.map((dev) => {
              const alreadyAdded = members.some((m) => m.id === dev.id);
              return (
                <button
                  key={dev.id}
                  onClick={() => addMember(dev)}
                  disabled={alreadyAdded}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs font-semibold transition-colors ${
                    alreadyAdded
                      ? "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
                  }`}
                >
                  <UserAvatar
                    name={dev.name}
                    initials={dev.initials}
                    size="xs"
                    fallbackBg={`${AVATAR_COLORS[0]} font-bold`}
                  />
                  <span className="truncate text-slate-800 dark:text-slate-100">{dev.name}</span>
                  {alreadyAdded && (
                    <Check size={12} className="ml-auto text-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No members yet. Click "Add Member" to start.
          </div>
        ) : (
          members.map((member, colorIdx) => {
            const isExpanded = expandedMemberId === member.id;
            return (
              <div
                key={member.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
              >
                {/* Member header row */}
                <div className="flex items-center gap-2.5 p-2.5">
                  <GripVertical size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                  <UserAvatar
                    name={member.name}
                    initials={member.initials}
                    size="sm"
                    fallbackBg={`${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]} font-bold`}
                    className="shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                      {member.name}
                    </div>
                    {/* Role selector */}
                    <div className="relative">
                      <select
                        value={member.role}
                        onChange={(e) => updateRole(member.id, e.target.value as MemberRole)}
                        onClick={(e) => e.stopPropagation()}
                        className="appearance-none text-[10px] font-semibold text-blue-600 bg-transparent border-none outline-none cursor-pointer pr-3 py-0"
                      >
                        {MEMBER_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={10}
                        className="absolute right-0 top-0.5 text-blue-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[10px] font-bold"
                      title={isExpanded ? "Collapse" : "Assign tasks"}
                    >
                      <ClipboardList size={13} />
                    </button>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expandable task assignment area */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-2.5 space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Assigned Tasks ({member.assignedTasks.length})
                    </p>

                    {member.assignedTasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                      >
                        <ClipboardList size={11} className="text-blue-400 shrink-0" />
                        <span className="flex-1 font-medium text-slate-700 dark:text-slate-200 truncate">
                          {task}
                        </span>
                        <button
                          onClick={() => removeTask(member.id, idx)}
                          className="text-slate-300 hover:text-red-500 shrink-0"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}

                    {/* Task input */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newTaskInputs[member.id] || ""}
                        onChange={(e) =>
                          setNewTaskInputs((prev) => ({ ...prev, [member.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addTask(member.id);
                        }}
                        placeholder="Assign a task..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                      />
                      <button
                        onClick={() => addTask(member.id)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
