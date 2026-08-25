"use client";

import { FilterDropdown } from "@/components/projects/filter-dropdown";
import type { DropdownKey, ViewMode } from "@/hooks/use-project-filters";
import {
  membersFilterOptions,
  owners,
  priorities,
  statuses,
  teamsList,
} from "@/lib/project-data";
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  LayoutGrid,
  Plus,
  Search,
  Shield,
  Sparkles,
  Table as TableIcon,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface ProjectsToolbarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
  selectedPriority: string;
  setSelectedPriority: (v: string) => void;
  selectedOwner: string;
  setSelectedOwner: (v: string) => void;
  selectedTeam: string;
  setSelectedTeam: (v: string) => void;
  teamOptions?: string[];
  selectedMembers: string;
  setSelectedMembers: (v: string) => void;
  openDropdown: DropdownKey;
  setOpenDropdown: (v: DropdownKey) => void;
  toggleDropdown: (key: DropdownKey) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  filteredCount: number;
}

export function ProjectsToolbar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedOwner,
  setSelectedOwner,
  selectedTeam,
  setSelectedTeam,
  teamOptions,
  selectedMembers,
  setSelectedMembers,
  openDropdown,
  setOpenDropdown,
  toggleDropdown,
  hasActiveFilters,
  clearFilters,
  viewMode,
  setViewMode,
  filteredCount,
}: ProjectsToolbarProps) {
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenDropdown]);

  return (
    <>
      {/* Filter Bar & New Project Button */}
      <div
        ref={filterBarRef}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input — widened to occupy significantly more horizontal space */}
          <div className="relative flex-1 min-w-[240px] sm:min-w-[280px] max-w-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, owner, team..."
              className="w-full pl-4 pr-9 py-2 bg-white dark:bg-[#14263e] border-2 border-[#142843]/70 dark:border-slate-500 rounded-xl text-xs font-medium text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-all"
              suppressHydrationWarning
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
                suppressHydrationWarning
              >
                <X size={14} />
              </button>
            ) : (
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#142843] dark:text-slate-300 pointer-events-none"
                size={14}
              />
            )}
          </div>

          <FilterDropdown
            label="Status"
            icon={<Filter size={14} />}
            value={selectedStatus}
            options={statuses}
            isOpen={openDropdown === "status"}
            onToggle={() => toggleDropdown("status")}
            onSelect={(val) => {
              setSelectedStatus(val);
              setOpenDropdown(null);
            }}
          />

          <FilterDropdown
            label="Team"
            icon={<Users size={14} />}
            value={selectedTeam}
            options={teamOptions && teamOptions.length > 0 ? teamOptions : teamsList}
            isOpen={openDropdown === "team"}
            onToggle={() => toggleDropdown("team")}
            onSelect={(val) => {
              setSelectedTeam(val);
              setOpenDropdown(null);
            }}
          />

          <FilterDropdown
            label="Priority"
            icon={<ArrowUpDown size={14} />}
            value={selectedPriority}
            options={priorities}
            isOpen={openDropdown === "priority"}
            onToggle={() => toggleDropdown("priority")}
            onSelect={(val) => {
              setSelectedPriority(val);
              setOpenDropdown(null);
            }}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer px-2.5 py-1.5 rounded-lg shrink-0"
              suppressHydrationWarning
            >
              <X size={13} className="mr-1" />
              Clear Filters
            </button>
          )}
        </div>

        <Link
          href="/projects/create"
          className="inline-flex items-center px-5 py-2.5 bg-[#0f2d5a] hover:bg-[#0c2447] text-white rounded-xl shadow-md font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto shrink-0"
          suppressHydrationWarning
        >
          <Plus size={18} className="mr-2" />
          New Project
        </Link>
      </div>

      {/* Results Counter & View Mode Toggle */}
      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-[#00b4d8]">{filteredCount}</strong> projects
          </span>
          {hasActiveFilters && (
            <span className="text-emerald-500 flex items-center gap-1 font-bold">
              <Sparkles size={13} /> Active Filters
            </span>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#14263e] border-2 border-[#142843]/80 dark:border-slate-500 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#142843] text-white dark:bg-[#00b4d8] dark:text-[#08131f] shadow-xs"
                : "text-slate-400 hover:text-[#142843] dark:hover:text-slate-200"
            }`}
            title="Grid view"
            aria-label="Grid view"
            suppressHydrationWarning
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
              viewMode === "table"
                ? "bg-[#142843] text-white dark:bg-[#00b4d8] dark:text-[#08131f] shadow-xs"
                : "text-slate-400 hover:text-[#142843] dark:hover:text-slate-200"
            }`}
            title="Table view"
            aria-label="Table view"
            suppressHydrationWarning
          >
            <TableIcon size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
