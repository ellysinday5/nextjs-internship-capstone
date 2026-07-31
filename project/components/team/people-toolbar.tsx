"use client"

import { Search, Filter, ArrowUpDown, ChevronDown, LayoutGrid, List } from "lucide-react"

interface PeopleToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
}

export function PeopleToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: PeopleToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        <Filter size={14} />
        Status
      </button>
      <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        <ArrowUpDown size={14} />
        Sort by
      </button>
      <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        Account Type
        <ChevronDown size={14} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-48 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#142843] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:w-64"
          />
        </div>

        <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-[#142843] text-white"
                : "bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400"
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-[#142843] text-white"
                : "bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}