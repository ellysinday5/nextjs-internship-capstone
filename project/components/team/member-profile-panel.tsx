"use client"

import { useState } from "react"
import { X, MessageSquare, Plus, Search, Filter, Clock } from "lucide-react"
import type { TeamMember } from "@/lib/team-data"

interface MemberProfilePanelProps {
  member: TeamMember | null
  onClose: () => void
}

const STATUS_DOT: Record<TeamMember["status"], string> = {
  Online: "bg-green-500",
  Away: "bg-amber-500",
  Offline: "bg-slate-300",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const TABS = ["Activity", "Task", "Comments", "Calendar"] as const

export function MemberProfilePanel({ member, onClose }: MemberProfilePanelProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Activity")

  if (!member) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0f1d31]">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#142843]">
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">
                  {initials(member.name)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {member.name}
              </h2>
              <button className="mb-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                Add description...
              </button>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[member.status]}`} />
                {member.status}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
              <MessageSquare size={16} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-100 px-5 dark:border-slate-800">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "border-[#142843] text-[#142843] dark:border-white dark:text-white"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {tab === "Task" ? "Task (0)" : tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <button className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <Plus size={14} />
            Add Time Off
          </button>

          <div className="mb-5 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
            <p>{member.email}</p>
            <p className="flex items-center gap-1.5">
              <Clock size={13} />
              Local time unavailable
            </p>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Priorities</h3>
              <button className="flex items-center gap-1 text-xs font-semibold text-[#142843] hover:underline dark:text-blue-300">
                <Plus size={12} />
                Add
              </button>
            </div>
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
              Add your most important task here
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Activity</h3>
              <div className="flex items-center gap-2 text-slate-400">
                <Search size={14} />
                <Filter size={14} />
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Only the last 24 hours of activities will be shown here
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}