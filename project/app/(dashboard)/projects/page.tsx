"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  X,
  Sparkles,
  Edit3,
  Trash2,
  FolderOpen,
  Users,
  ClipboardList,
} from "lucide-react";

import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { EditProjectModal } from "@/components/modals/edit-project-modal";
import { DeleteProjectModal } from "@/components/modals/delete-project-modal";
import { getProjectsAction, ProjectWithStats } from "@/app/actions/project-actions";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  category: string;
  status: string;
  priority: string;
  progress: number;
  members: number;
  tasksCount: number;
  updatedAt: string;
  color: string;
  isDb?: boolean;
  dbProject?: ProjectWithStats;
}

const initialProjects: ProjectItem[] = [
  {
    id: "proj-1",
    name: "ProjectFlow Next.js Architecture",
    description:
      "Full-stack project management web app with Next.js 16, Drizzle ORM, and Clerk Auth.",
    techStack: ["Next.js", "TypeScript", "TailwindCSS", "PostgreSQL"],
    category: "Frontend",
    status: "In Progress",
    priority: "High",
    progress: 75,
    members: 5,
    tasksCount: 18,
    updatedAt: "2 hours ago",
    color: "bg-[#00b4d8]",
  },
  {
    id: "proj-2",
    name: "Cloud Native API Gateway",
    description: "High-performance Microservice API Gateway deployed on AWS Kubernetes cluster.",
    techStack: ["Node.js", "Docker", "Kubernetes", "AWS"],
    category: "Backend",
    status: "In Progress",
    priority: "High",
    progress: 50,
    members: 8,
    tasksCount: 24,
    updatedAt: "4 hours ago",
    color: "bg-emerald-500",
  },
  {
    id: "proj-3",
    name: "AI Code Assistant Integration",
    description: "Integrating Gemini LLM code suggestions and automated pull request summaries.",
    techStack: ["Python", "FastAPI", "OpenAI", "VectorDB"],
    category: "AI & Data",
    status: "Review",
    priority: "Medium",
    progress: 88,
    members: 4,
    tasksCount: 12,
    updatedAt: "1 day ago",
    color: "bg-purple-500",
  },
];

const categories = [
  "All",
  "Frontend",
  "Backend",
  "Cloud & DevOps",
  "Cybersecurity",
  "AI & Data",
  "Mobile",
];
const statuses = ["All", "In Progress", "Review", "Planning", "Completed"];
const priorities = ["All", "High", "Medium", "Low"];

export default function ProjectsPage() {
  const [dbProjects, setDbProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  /* Modal state */
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithStats | null>(null);

  /* Filter state */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");

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

  /* Combine DB projects and initial fallback projects */
  const allProjectItems = useMemo<ProjectItem[]>(() => {
    const formattedDbItems: ProjectItem[] = dbProjects.map((p) => {
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
        tasksCount: p.taskCount,
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "Just now",
        color: "bg-[#00b4d8]",
        isDb: true,
        dbProject: p,
      };
    });

    return [...formattedDbItems, ...initialProjects];
  }, [dbProjects]);

  /* Filtered projects */
  const filteredProjects = useMemo(() => {
    return allProjectItems.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;
      const matchesPriority = selectedPriority === "All" || project.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [allProjectItems, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "All" ||
    selectedStatus !== "All" ||
    selectedPriority !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSelectedPriority("All");
  };

  return (
    <div className="relative min-h-screen space-y-6 overflow-hidden">
      {/* ── Modals ── */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchProjects}
      />
      <EditProjectModal
        isOpen={Boolean(editingProject)}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSuccess={fetchProjects}
      />
      <DeleteProjectModal
        isOpen={Boolean(deletingProject)}
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onSuccess={fetchProjects}
      />

      <div className="relative z-10 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142843] dark:text-white">
              Projects
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Search, filter, create, and manage your team projects and workflows
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-[#00b4d8] hover:bg-[#0096b8] text-white rounded-xl shadow-md font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
            suppressHydrationWarning
          >
            <Plus size={18} className="mr-2" />
            New Project
          </button>
        </div>

        {/* Dynamic Filter Controls Bar */}
        <div className="bg-white/80 dark:bg-[#14263e]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          {/* Search bar & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, description, or tech..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#1c304a] border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
                suppressHydrationWarning
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear search"
                  suppressHydrationWarning
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Select */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-[#1c304a] border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-[#142843] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] font-medium"
                suppressHydrationWarning
              >
                <option value="All">All Statuses</option>
                {statuses.slice(1).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-[#1c304a] border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-[#142843] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] font-medium"
                suppressHydrationWarning
              >
                <option value="All">All Priorities</option>
                {priorities.slice(1).map((priority) => (
                  <option key={priority} value={priority}>
                    Priority: {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tech Stack Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter size={12} /> Tech Category:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#142843] text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  suppressHydrationWarning
                >
                  {cat}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex items-center text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                suppressHydrationWarning
              >
                <X size={12} className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-[#00b4d8]">{filteredProjects.length}</strong> projects
          </span>
          {hasActiveFilters && (
            <span className="text-emerald-500 flex items-center gap-1">
              <Sparkles size={12} /> Dynamic Filter Active
            </span>
          )}
        </div>

        {/* Dynamic Project Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:border-[#00b4d8]/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category, Priority, & Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${project.color}`} />
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {project.category}
                      </span>
                      {project.isDb && (
                        <span className="text-[10px] font-extrabold text-[#00b4d8] bg-[#e8f8fd] dark:bg-[#00b4d8]/20 px-2 py-0.5 rounded-full">
                          Database
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          project.priority === "High"
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            : project.priority === "Medium"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {project.priority} Prio
                      </span>

                      {/* Edit / Delete Buttons for DB projects or custom projects */}
                      {project.isDb && project.dbProject && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => setEditingProject(project.dbProject!)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00b4d8] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit project"
                            aria-label="Edit project"
                            suppressHydrationWarning
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProject(project.dbProject!)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Delete project"
                            aria-label="Delete project"
                            suppressHydrationWarning
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-[#142843] dark:text-white group-hover:text-[#00b4d8] transition-colors mb-2">
                    {project.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Completion</span>
                      <span className="text-[#142843] dark:text-slate-200 font-bold">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${project.color}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Meta Details */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-slate-400" />
                        {project.members} dev
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList size={13} className="text-slate-400" />
                        {project.tasksCount} tasks
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        project.status === "In Progress"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : project.status === "Review"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                            : project.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
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
          </div>
        )}
      </div>
    </div>
  );
}
