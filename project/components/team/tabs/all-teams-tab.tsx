"use client"

import { Users, Plus } from "lucide-react"
import type { Team } from "@/lib/team-data"

interface AllTeamsTabProps {
  teams: Team[]
  onCreateTeam: () => void
}

export function AllTeamsTab({ teams, onCreateTeam }: AllTeamsTabProps) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#142843]/10 text-[#142843] dark:bg-blue-950/40 dark:text-blue-400">
          <Users size={28} />
        </div>
        <h2 className="text-lg font-bold text-[#142843] dark:text-white">No teams yet</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Create your first team to organize members and collaborate on projects.
        </p>
        <button
          type="button"
          onClick={onCreateTeam}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#142843] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f1f35]"
        >
          <Plus size={16} />
          Create Team
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <div
          key={team.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#142843]/10 text-[#142843] dark:bg-blue-950/40 dark:text-blue-400">
              <Users size={18} />
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {team.members.length} {team.members.length === 1 ? "member" : "members"}
            </span>
          </div>
          <h3 className="mt-4 text-base font-bold text-[#142843] dark:text-white">{team.name}</h3>
          {team.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
              {team.description}
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onCreateTeam}
        className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-500 transition-colors hover:border-[#142843] hover:text-[#142843] dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:text-blue-400"
      >
        <Plus size={20} />
        Create Team
      </button>
    </div>
  )
}
