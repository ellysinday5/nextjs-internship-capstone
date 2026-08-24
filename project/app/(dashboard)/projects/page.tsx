"use client";

<<<<<<< HEAD
import type { ProjectWithStats } from "@/actions/project-actions";
import { DeleteProjectModal } from "@/components/modals/delete-project-modal";
=======
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  FolderOpen,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type ProjectWithStats, getProjectsAction } from "@/app/actions/project-actions";
import { DeleteProjectModal } from "@/components/modals/delete-project-modal";
import Link from "next/link";

import {
  type ProjectItem,
  categories,
  membersFilterOptions,
  owners,
  priorities,
  statuses,
  teamsList,
} from "@/lib/project-data";

import { FilterDropdown } from "@/components/projects/filter-dropdown";
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectCardSkeleton } from "@/components/projects/project-card-item";
import { ProjectTableView } from "@/components/projects/project-table-view";
import { ProjectsToolbar } from "@/components/projects/projects-toolbar";
import { useProjectFilters } from "@/hooks/use-project-filters";
import { FolderOpen } from "lucide-react";
import { useState } from "react";

export default function ProjectsPage() {
<<<<<<< HEAD
  const {
    loading,
    filteredProjects,
    fetchProjects,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    selectedOwner,
    setSelectedOwner,
    selectedTeam,
    setSelectedTeam,
    selectedMembers,
    setSelectedMembers,
    openDropdown,
    setOpenDropdown,
    viewMode,
    setViewMode,
    hasActiveFilters,
    clearFilters,
    toggleDropdown,
  } = useProjectFilters();
=======
  const [dbProjects, setDbProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  // Local (non-DB) project overrides — stores edited versions in state
  const [localProjectOverrides, setLocalProjectOverrides] = useState<
    Record<string, Partial<ProjectItem>>
  >({});
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)

  const [deletingProject, setDeletingProject] = useState<ProjectWithStats | null>(null);

<<<<<<< HEAD
=======
  // We no longer handle local save via modal callback.
  // State is hydrated from localStorage instead (saved by the EditProjectPage).
  useEffect(() => {
    try {
      const stored = localStorage.getItem("syntraflow_local_project_overrides");
      if (stored) {
        setLocalProjectOverrides(JSON.parse(stored));
      }
    } catch {}
  }, []);

  /* Filter state */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedOwner, setSelectedOwner] = useState("All");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedMembers, setSelectedMembers] = useState("All");
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);

  /* View mode: grid or table */
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filterBarRef = useRef<HTMLDivElement>(null);

  /* Close open dropdown when clicking outside the filter bar */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Fetch DB Projects */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const result = await getProjectsAction();
    setDbProjects(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* DB projects only — mock/local fallback projects removed */
  const allProjectItems = useMemo<ProjectItem[]>(() => {
    const ownerOptions = ["Ellen Grace Sinday", "Aj Lopez", "John Doe"];
    const teamOptions = ["Core Platform", "Frontend Squad", "AI & Mobile", "DevOps Team"];

    return dbProjects.map((p, idx) => {
      const completionPercent =
        p.taskCount > 0 ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description || "No description provided.",
        techStack: ["Drizzle", "PostgreSQL", "Clerk"],
        category: "Frontend",
        status: completionPercent === 100 ? "Completed" : "In Progress",
        priority: "High",
        progress: completionPercent,
        members: 1,
        owner: ownerOptions[idx % ownerOptions.length],
        teamName: teamOptions[idx % teamOptions.length],
        tasksCount: p.taskCount,
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "Just now",
        color: "bg-[#00b4d8]",
        isDb: true,
        dbProject: p,
      };
    });
  }, [dbProjects]);

  /* Filtered projects */
  const filteredProjects = useMemo(() => {
    return allProjectItems.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;
      const matchesPriority = selectedPriority === "All" || project.priority === selectedPriority;
      const matchesOwner = selectedOwner === "All" || project.owner === selectedOwner;
      const matchesTeam = selectedTeam === "All" || project.teamName === selectedTeam;

      let matchesMembers = true;
      if (selectedMembers === "1 Dev") {
        matchesMembers = project.members === 1;
      } else if (selectedMembers === "2-4 Devs") {
        matchesMembers = project.members >= 2 && project.members <= 4;
      } else if (selectedMembers === "5+ Devs") {
        matchesMembers = project.members >= 5;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesPriority &&
        matchesOwner &&
        matchesTeam &&
        matchesMembers
      );
    });
  }, [
    allProjectItems,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedPriority,
    selectedOwner,
    selectedTeam,
    selectedMembers,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "All" ||
    selectedStatus !== "All" ||
    selectedPriority !== "All" ||
    selectedOwner !== "All" ||
    selectedTeam !== "All" ||
    selectedMembers !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSelectedPriority("All");
    setSelectedOwner("All");
    setSelectedTeam("All");
    setSelectedMembers("All");
  };

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <div className="relative min-h-0 space-y-6 overflow-visible">
        <DeleteProjectModal
          isOpen={Boolean(deletingProject)}
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onSuccess={fetchProjects}
        />

<<<<<<< HEAD
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142843] dark:text-white tracking-tight">
              Projects
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1 font-medium">
              Manage your projects, track progress, and collaborate with your team.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <ProjectsToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
            selectedOwner={selectedOwner}
            setSelectedOwner={setSelectedOwner}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            selectedMembers={selectedMembers}
            setSelectedMembers={setSelectedMembers}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            toggleDropdown={toggleDropdown}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filteredCount={filteredProjects.length}
          />

          {/* Projects Grid / Table */}
          {loading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <ProjectCardSkeleton key={n} />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-[#14263e]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#142843] text-white">
                      <tr>
                        {[
                          "Project",
                          "Category",
                          "Status",
                          "Priority",
                          "Owner",
                          "Team",
                          "Progress",
                          "Devs",
                          "Tasks",
                          "Updated",
                          "Actions",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-100 whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <tr key={n}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                              <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                            </div>
                          </td>
                          {[...Array(9)].map((_, i) => (
                            <td key={i} className="px-5 py-3.5">
                              <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                            </td>
                          ))}
                          <td className="px-5 py-3.5 text-right">
                            <div className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-slate-700 ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : filteredProjects.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onProjectDeleted={fetchProjects}
                  />
                ))}
              </div>
            ) : (
              <ProjectTableView
                projects={filteredProjects}
                onEdit={() => {}}
                onDelete={setDeletingProject}
              />
            )
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#14263e] rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <FolderOpen size={48} className="mx-auto text-slate-400 mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-[#142843] dark:text-white mb-1">
                No matching projects found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Try adjusting your search terms or filter selection.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-[#00b4d8] text-white rounded-xl text-xs font-bold hover:bg-[#0096b8] transition-colors cursor-pointer"
                suppressHydrationWarning
              >
                Reset All Filters
              </button>
=======
      <div className="relative z-10 space-y-6">
        {/* Filter Bar & New Project Button */}
        <div
          ref={filterBarRef}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input — fixed shorter width */}
            <div className="relative w-56">
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

            {/* Owner Filter */}
            <FilterDropdown
              label="Owner"
              icon={<User size={14} />}
              value={selectedOwner}
              options={owners}
              isOpen={openDropdown === "owner"}
              onToggle={() => toggleDropdown("owner")}
              onSelect={(val) => {
                setSelectedOwner(val);
                setOpenDropdown(null);
              }}
            />

            {/* Team Filter */}
            <FilterDropdown
              label="Team"
              icon={<Shield size={14} />}
              value={selectedTeam}
              options={teamsList}
              isOpen={openDropdown === "team"}
              onToggle={() => toggleDropdown("team")}
              onSelect={(val) => {
                setSelectedTeam(val);
                setOpenDropdown(null);
              }}
            />

            {/* Members Filter */}
            <FilterDropdown
              label="Members"
              icon={<Users size={14} />}
              value={selectedMembers}
              options={membersFilterOptions}
              isOpen={openDropdown === "members"}
              onToggle={() => toggleDropdown("members")}
              onSelect={(val) => {
                setSelectedMembers(val);
                setOpenDropdown(null);
              }}
            />

            {/* Category */}
            <FilterDropdown
              label="Category"
              icon={<ChevronDown size={14} />}
              value={selectedCategory}
              options={categories}
              isOpen={openDropdown === "category"}
              onToggle={() => toggleDropdown("category")}
              onSelect={(val) => {
                setSelectedCategory(val);
                setOpenDropdown(null);
              }}
            />

            {/* Status */}
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

            {/* Priority */}
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
                className="inline-flex items-center text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer px-2.5 py-1.5 rounded-lg"
                suppressHydrationWarning
              >
                <X size={13} className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>

          {/* New Project Button aligned on the right of the filter bar */}
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
              Showing <strong className="text-[#00b4d8]">{filteredProjects.length}</strong> projects
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

        {/* Projects: Grid or Table */}
        {filteredProjects.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onProjectDeleted={fetchProjects} />
              ))}
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
