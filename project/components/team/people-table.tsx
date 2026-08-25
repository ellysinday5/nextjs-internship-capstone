"use client";

import { type TeamMember, formatRole } from "@/lib/team-data";

interface PeopleTableProps {
  members: TeamMember[];
  onSelectMember: (member: TeamMember) => void;
}

const STATUS_DOT: Record<TeamMember["status"], string> = {
  Online: "bg-green-500",
  Away: "bg-amber-500",
  Offline: "bg-slate-300",
};

export function PeopleTable({ members, onSelectMember }: PeopleTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[500px]">
        <thead className="bg-[#142843] text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">User Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {members.map((member) => (
            <tr
              key={member.id}
              onClick={() => onSelectMember(member)}
              className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                {member.name}
              </td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{member.email}</td>
              <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                {formatRole(member.role)}
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[member.status]}`} />
                  {member.status}
                </span>
              </td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                No members found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
