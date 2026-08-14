"use client"

import { useState, useMemo } from "react"
import { Users, Plus, Search, X } from "lucide-react"
import type { Team } from "@/lib/team-data"

interface AllTeamsTabProps {
  teams: Team[]
  onCreateTeam: () => void
}

export function AllTeamsTab({ teams, onCreateTeam }: AllTeamsTabProps) {
  const [search, setSearch] = useState("")
  const [memberFilter, setMemberFilter] = useState<"all" | "small" | "large">("all")

  const filtered = useMemo(() => {
    let result = teams
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
      )
    }
    if (memberFilter === "small") result = result.filter((t) => t.members.length < 5)
    if (memberFilter === "large") result = result.filter((t) => t.members.length >= 5)
    return result
  }, [teams, search, memberFilter])

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
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="w-full rounded-xl border-2 border-slate-200 bg-white py-2 pl-8 pr-9 text-xs font-medium text-[#142843] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#142843]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Member size filter */}
        <div className="flex items-center rounded-xl border-2 border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900 text-xs font-semibold">
          {(["all", "small", "large"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setMemberFilter(opt)}
              className={`px-3 py-2 capitalize transition-colors ${
                memberFilter === opt
                  ? "bg-[#142843] text-white"
                  : "text-slate-500 hover:text-[#142843] dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {opt === "all" ? "All Sizes" : opt === "small" ? "< 5 members" : "≥ 5 members"}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs font-semibold text-slate-400">
          {filtered.length} / {teams.length} team{teams.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-sm font-semibold text-slate-500">No teams match your filters.</p>
          <button type="button" onClick={() => { setSearch(""); setMemberFilter("all") }} className="mt-2 text-xs font-bold text-[#142843] hover:underline dark:text-blue-400">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team) => (
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
      )}
    </div>
  )
}
