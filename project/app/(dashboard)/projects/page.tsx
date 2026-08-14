"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { DeleteProjectModal } from "@/components/modals/delete-project-modal";
import { ProjectWithStats } from "@/actions/project-actions";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectTableView } from "@/components/projects/project-table-view";
import { ProjectCardSkeleton } from "@/components/projects/project-card-item";
import { ProjectsToolbar } from "@/components/projects/projects-toolbar";
import { useProjectFilters } from "@/hooks/use-project-filters";

export default function ProjectsPage() {
  const {
    loading, filteredProjects, fetchProjects,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedStatus, setSelectedStatus,
    selectedPriority, setSelectedPriority,
    selectedOwner, setSelectedOwner,
    selectedTeam, setSelectedTeam,
    selectedMembers, setSelectedMembers,
    openDropdown, setOpenDropdown,
    viewMode, setViewMode,
    hasActiveFilters, clearFilters, toggleDropdown,
  } = useProjectFilters();

  const [deletingProject, setDeletingProject] = useState<ProjectWithStats | null>(null);

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <div className="relative min-h-0 space-y-6 overflow-visible">
        <DeleteProjectModal
          isOpen={Boolean(deletingProject)}
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onSuccess={fetchProjects}
        />

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
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
            selectedPriority={selectedPriority} setSelectedPriority={setSelectedPriority}
            selectedOwner={selectedOwner} setSelectedOwner={setSelectedOwner}
            selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam}
            selectedMembers={selectedMembers} setSelectedMembers={setSelectedMembers}
            openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
            toggleDropdown={toggleDropdown}
            hasActiveFilters={hasActiveFilters} clearFilters={clearFilters}
            viewMode={viewMode} setViewMode={setViewMode}
            filteredCount={filteredProjects.length}
          />

          {/* Projects Grid / Table */}
          {loading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => <ProjectCardSkeleton key={n} />)}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-[#14263e]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#142843] text-white">
                      <tr>
                        {["Project", "Category", "Status", "Priority", "Owner", "Team", "Progress", "Devs", "Tasks", "Updated", "Actions"].map((col) => (
                          <th key={col} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-100 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <tr key={n}>
                          <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" /><div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700" /></div></td>
                          {[...Array(9)].map((_, i) => <td key={i} className="px-5 py-3.5"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" /></td>)}
                          <td className="px-5 py-3.5 text-right"><div className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-slate-700 ml-auto" /></td>
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
                  <ProjectCard key={project.id} project={project} onProjectDeleted={fetchProjects} />
                ))}
              </div>
            ) : (
              <ProjectTableView projects={filteredProjects} onEdit={() => {}} onDelete={setDeletingProject} />
            )
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#14263e] rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <FolderOpen size={48} className="mx-auto text-slate-400 mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-[#142843] dark:text-white mb-1">No matching projects found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Try adjusting your search terms or filter selection.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-[#00b4d8] text-white rounded-xl text-xs font-bold hover:bg-[#0096b8] transition-colors cursor-pointer"
                suppressHydrationWarning
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}