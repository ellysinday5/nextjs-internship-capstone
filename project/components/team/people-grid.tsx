"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import type { TeamMember } from "@/lib/team-data";

interface PeopleGridProps {
  members: TeamMember[];
  selectedId?: string;
  onSelectMember: (member: TeamMember) => void;
}

const STATUS_DOT: Record<TeamMember["status"], string> = {
  Online: "bg-green-500",
  Away: "bg-amber-500",
  Offline: "bg-slate-300",
};

export function PeopleGrid({ members, selectedId, onSelectMember }: PeopleGridProps) {
  if (members.length === 0) {
    return <p className="py-8 text-center text-slate-400">No members found.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((member) => (
        <button
          key={member.id}
          onClick={() => onSelectMember(member)}
          className={`flex flex-col items-center rounded-xl border-2 bg-white p-4 text-center transition-colors cursor-pointer dark:bg-slate-900 ${
            selectedId === member.id
              ? "border-[#3151b7]"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          }`}
        >
          <div className="relative mb-3 shrink-0">
            <UserAvatar
              src={member.avatarUrl}
              name={member.name}
              size="2xl"
              shape="rounded-xl"
            />
            <span
              className={`absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${STATUS_DOT[member.status]}`}
            />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {member.name}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{member.role}</span>
        </button>
      ))}
    </div>
  );
}
