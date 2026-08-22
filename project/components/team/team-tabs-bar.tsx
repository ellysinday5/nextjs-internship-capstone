"use client";

import { BarChart2, Mail, UserCog, Users } from "lucide-react";
import { UserPlus } from "lucide-react";

export type TeamTab = "all-teams" | "all-people" | "analytics" | "my-invites";

interface TeamTabsBarProps {
  activeTab: TeamTab;
  onTabChange: (tab: TeamTab) => void;
  onInviteClick?: () => void;
  canInvite?: boolean;
}

type TabConfig = {
  id: TeamTab;
  label: string;
  icon?: typeof Users;
};

const TABS: TabConfig[] = [
  { id: "all-teams", label: "All Teams", icon: Users },
  { id: "all-people", label: "All People", icon: UserCog },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "my-invites", label: "My Invites", icon: Mail },
];

export function TeamTabsBar({
  activeTab,
  onTabChange,
  onInviteClick,
  canInvite = false,
}: TeamTabsBarProps) {
  return (
    <div className="w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center divide-x divide-slate-200 overflow-x-auto dark:divide-slate-700">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-2 px-4 py-1.5 text-sm font-semibold transition-colors first:pl-0 last:pr-0 ${
                  isActive
                    ? "text-[#142843] dark:text-white"
                    : "text-slate-500 hover:text-[#142843] dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {Icon && <Icon size={16} className="shrink-0" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {canInvite && onInviteClick && (
          <button
            type="button"
            onClick={onInviteClick}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#142843] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f1f35] sm:self-auto"
          >
            <UserPlus size={16} />
            Invite
          </button>
        )}
      </div>
    </div>
  );
}
