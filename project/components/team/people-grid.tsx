"use client";

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

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
          className={`flex flex-col items-center rounded-xl border-2 bg-white p-4 text-center transition-colors dark:bg-slate-900 ${
            selectedId === member.id
              ? "border-[#3151b7]"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          }`}
        >
          <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-xl bg-[#142843]">
            {member.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-white">
                {initials(member.name)}
              </span>
            )}
            <span
              className={`absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white ${STATUS_DOT[member.status]}`}
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
