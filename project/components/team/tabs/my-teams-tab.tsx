"use client"

import { Users } from "lucide-react"
import type { Team } from "@/lib/team-data"

interface MyTeamsTabProps {
  teams: Team[]
}

export function MyTeamsTab({ teams }: MyTeamsTabProps) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Users size={28} />
        </div>
        <h2 className="text-lg font-bold text-[#142843] dark:text-white">You&apos;re not on any teams yet</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Teams you join or create will appear here for quick access.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[#142843] dark:text-white">My Teams</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Teams you belong to in this workspace.
        </p>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#142843]/10 text-[#142843] dark:bg-blue-950/40 dark:text-blue-400">
              <Users size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[#142843] dark:text-white">{team.name}</p>
              {team.description && (
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{team.description}</p>
              )}
            </div>
            <span className="shrink-0 text-xs font-semibold text-slate-400">
              {team.members.length} members
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
