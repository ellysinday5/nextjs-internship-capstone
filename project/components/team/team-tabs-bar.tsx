"use client"

import { Users, UserCircle, BarChart2, UserPlus } from "lucide-react"

export type TeamTab = "all-teams" | "all-people" | "analytics" | "my-teams"

interface TeamTabsBarProps {
  activeTab: TeamTab
  onTabChange: (tab: TeamTab) => void
  activeTeamName?: string
  showInvite?: boolean
  onInviteClick?: () => void
}

const TABS: { id: TeamTab; label: string; icon: typeof Users }[] = [
  { id: "all-teams", label: "All Teams", icon: Users },
  { id: "all-people", label: "All People", icon: UserCircle },
//   { id: "analytics", label: "Analytics", icon: BarChart2 },
]

export function TeamTabsBar({
  activeTab,
  onTabChange,
  activeTeamName,
  showInvite,
  onInviteClick,
}: TeamTabsBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-0 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 overflow-x-auto">
        {activeTeamName && (
          <span className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 sm:flex">
            Teams
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-[#142843] dark:text-white">{activeTeamName}</span>
          </span>
        )}

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-[#142843] text-[#142843] dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          )
        })}

        <button
          onClick={() => onTabChange("my-teams")}
          className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
            activeTab === "my-teams"
              ? "border-[#142843] text-[#142843] dark:border-white dark:text-white"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          My Teams
        </button>
      </div>

      {showInvite && (
        <button
          onClick={onInviteClick}
          className="mb-3 flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#142843] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f1f35] sm:self-auto"
        >
          <UserPlus size={16} />
          Invite
        </button>
      )}
    </div>
  )
}