"use client";

import type { TeamMember } from "@/lib/team-data";
import { ArrowUpDown, ChevronDown, Filter, LayoutGrid, List, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type StatusFilter = "All" | "Online" | "Away" | "Offline";
type SortOption = "name-asc" | "name-desc" | "role";
type AccountTypeFilter = "All" | "Admin" | "Member";

interface PeopleToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  sortBy: SortOption;
  onSortChange: (v: SortOption) => void;
  accountType: AccountTypeFilter;
  onAccountTypeChange: (v: AccountTypeFilter) => void;
}

const btnBase =
  "inline-flex items-center justify-between gap-2 px-3.5 py-2 min-w-[108px] rounded-xl border-2 text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap hover:shadow-md hover:-translate-y-0.5 active:scale-95";

const btnDefault =
  "border-[#142843]/70 dark:border-slate-500 text-[#142843] dark:text-slate-100 bg-white dark:bg-[#14263e] hover:border-[#00b4d8] hover:bg-slate-50 dark:hover:bg-[#1c304a] hover:text-[#00b4d8]";

const btnActive =
  "border-[#142843] bg-[#142843] text-white dark:border-[#00b4d8] dark:bg-[#00b4d8] dark:text-[#08131f]";

export function PeopleToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  accountType,
  onAccountTypeChange,
}: PeopleToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<"status" | "sort" | "account" | null>(null);

  const toggle = (key: "status" | "sort" | "account") => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const SORT_LABELS: Record<SortOption, string> = {
    "name-asc": "Name (A–Z)",
    "name-desc": "Name (Z–A)",
    role: "Role",
  };

  const SORT_BUTTON_LABEL = sortBy === "name-asc" ? "Sort By" : SORT_LABELS[sortBy];

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search — LEFT side */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search members..."
          className="w-full pl-4 pr-9 py-2 bg-white dark:bg-[#14263e] border-2 border-[#142843]/70 dark:border-slate-500 rounded-xl text-xs font-medium text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-all"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={13} />
          </button>
        ) : (
          <Search
            size={13}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
      </div>

      {/* Status filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("status")}
          className={`${btnBase} ${statusFilter !== "All" ? btnActive : btnDefault}`}
        >
          <span>{statusFilter !== "All" ? statusFilter : "Status"}</span>
          <Filter size={13} className="shrink-0" />
        </button>
        {openDropdown === "status" && (
          <div className="absolute left-0 top-10 z-30 w-40 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 animate-in fade-in-50 zoom-in-95">
            {(["All", "Online", "Away", "Offline"] as StatusFilter[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onStatusFilterChange(opt);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === opt
                    ? "bg-[#00b4d8]/15 text-[#00b4d8]"
                    : "text-[#142843] dark:text-slate-100 hover:bg-[#00b4d8]/10 hover:text-[#00b4d8]"
                }`}
              >
                {opt === "All" ? "All Statuses" : opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort By filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("sort")}
          className={`${btnBase} ${sortBy !== "name-asc" ? btnActive : btnDefault}`}
        >
          <span>{SORT_BUTTON_LABEL}</span>
          <ArrowUpDown size={13} className="shrink-0" />
        </button>
        {openDropdown === "sort" && (
          <div className="absolute left-0 top-10 z-30 w-44 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 animate-in fade-in-50 zoom-in-95">
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onSortChange(val);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  sortBy === val
                    ? "bg-[#00b4d8]/15 text-[#00b4d8]"
                    : "text-[#142843] dark:text-slate-100 hover:bg-[#00b4d8]/10 hover:text-[#00b4d8]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Account Type filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("account")}
          className={`${btnBase} ${accountType !== "All" ? btnActive : btnDefault}`}
        >
          <span>{accountType !== "All" ? accountType : "Account Type"}</span>
          <ChevronDown size={13} className="shrink-0" />
        </button>
        {openDropdown === "account" && (
          <div className="absolute left-0 top-10 z-30 w-40 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 animate-in fade-in-50 zoom-in-95">
            {(["All", "Admin", "Member"] as AccountTypeFilter[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onAccountTypeChange(opt);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  accountType === opt
                    ? "bg-[#00b4d8]/15 text-[#00b4d8]"
                    : "text-[#142843] dark:text-slate-100 hover:bg-[#00b4d8]/10 hover:text-[#00b4d8]"
                }`}
              >
                {opt === "All" ? "All Types" : opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#14263e] border-2 border-[#142843]/80 dark:border-slate-500 rounded-xl shadow-sm">
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
            viewMode === "list"
              ? "bg-[#142843] text-white dark:bg-[#00b4d8] dark:text-[#08131f] shadow-sm"
              : "text-slate-400 hover:text-[#142843] dark:hover:text-slate-200"
          }`}
          aria-label="List view"
        >
          <List size={15} />
        </button>
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
            viewMode === "grid"
              ? "bg-[#142843] text-white dark:bg-[#00b4d8] dark:text-[#08131f] shadow-sm"
              : "text-slate-400 hover:text-[#142843] dark:hover:text-slate-200"
          }`}
          aria-label="Grid view"
        >
          <LayoutGrid size={15} />
        </button>
      </div>
    </div>
  );
}
