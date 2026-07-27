"use client"

import { useState, useMemo } from "react"
import { Plus, Search, Filter, X, Code, Terminal, CheckCircle2, Clock, ShieldAlert, Sparkles, Layers } from "lucide-react"

interface ProjectItem {
  id: string
  name: string
  description: string
  techStack: string[]
  category: "Frontend" | "Backend" | "Cloud & DevOps" | "Cybersecurity" | "AI & Data" | "Mobile"
  status: "In Progress" | "Review" | "Planning" | "Completed"
  priority: "High" | "Medium" | "Low"
  progress: number
  members: number
  tasksCount: number
  updatedAt: string
  color: string
}

const initialProjects: ProjectItem[] = [
  {
    id: "proj-1",
    name: "ProjectFlow Next.js Architecture",
    description: "Full-stack project management web app with Next.js 15, Drizzle ORM, and Clerk Auth.",
    techStack: ["Next.js", "TypeScript", "TailwindCSS", "PostgreSQL"],
    category: "Frontend",
    status: "In Progress",
    priority: "High",
    progress: 75,
    members: 5,
    tasksCount: 18,
    updatedAt: "2 hours ago",
    color: "bg-blue_munsell-500",
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
  {
    id: "proj-4",
    name: "Zero Trust Security Audit",
    description: "Automated vulnerability scanning, secret detection, and IAM access compliance.",
    techStack: ["Cybersecurity", "OAuth2", "Vault", "AuditLog"],
    category: "Cybersecurity",
    status: "Planning",
    priority: "High",
    progress: 25,
    members: 3,
    tasksCount: 9,
    updatedAt: "3 days ago",
    color: "bg-rose-500",
  },
  {
    id: "proj-5",
    name: "DevOps CI/CD Pipeline Automation",
    description: "Automated testing, container vulnerability scanning, and multi-region deployment.",
    techStack: ["GitHub Actions", "Terraform", "Docker", "AWS"],
    category: "Cloud & DevOps",
    status: "Completed",
    priority: "Medium",
    progress: 100,
    members: 6,
    tasksCount: 30,
    updatedAt: "5 days ago",
    color: "bg-teal-500",
  },
  {
    id: "proj-6",
    name: "Mobile Kanban Task Tracker",
    description: "Cross-platform mobile application for real-time task management and push notifications.",
    techStack: ["React Native", "Expo", "GraphQL", "Zustand"],
    category: "Mobile",
    status: "In Progress",
    priority: "Low",
    progress: 60,
    members: 4,
    tasksCount: 15,
    updatedAt: "1 week ago",
    color: "bg-indigo-500",
  },
]

const categories = ["All", "Frontend", "Backend", "Cloud & DevOps", "Cybersecurity", "AI & Data", "Mobile"]
const statuses = ["All", "In Progress", "Review", "Planning", "Completed"]
const priorities = ["All", "High", "Medium", "Low"]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedPriority, setSelectedPriority] = useState("All")

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory

      // Status filter
      const matchesStatus = selectedStatus === "All" || project.status === selectedStatus

      // Priority filter
      const matchesPriority = selectedPriority === "All" || project.priority === selectedPriority

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority
    })
  }, [searchQuery, selectedCategory, selectedStatus, selectedPriority])

  const hasActiveFilters =
    searchQuery !== "" || selectedCategory !== "All" || selectedStatus !== "All" || selectedPriority !== "All"

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All")
    setSelectedStatus("All")
    setSelectedPriority("All")
  }

  return (
    <div className="relative min-h-screen space-y-6 overflow-hidden">
      {/* IT Theme Code Background Overlay (Subtle, non-overcrowded) */}
      <div className="relative z-10 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
              Projects
            </h1>
            <p className="text-payne's_gray-500 dark:text-french_gray-500 text-sm mt-1">
              Search, filter, and manage your team projects and task workflows
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2.5 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 shadow-md font-medium text-sm transition-all hover:scale-[1.02]">
            <Plus size={18} className="mr-2" />
            New Project
          </button>
        </div>

        {/* Dynamic Filter Controls Bar */}
        <div className="bg-white/80 dark:bg-outer_space-500/80 backdrop-blur-md p-4 rounded-xl border border-french_gray-300 dark:border-payne's_gray-400 shadow-sm space-y-4">
          {/* Search bar & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-payne's_gray-500 dark:text-french_gray-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, description, or tech (e.g. Next.js, Docker)..."
                className="w-full pl-10 pr-9 py-2 bg-platinum-900/50 dark:bg-outer_space-600/60 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-sm text-outer_space-500 dark:text-platinum-500 placeholder-payne's_gray-500 dark:placeholder-french_gray-400 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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
                className="w-full py-2 px-3 bg-platinum-900/50 dark:bg-outer_space-600/60 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-sm text-outer_space-500 dark:text-platinum-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 font-medium"
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
                className="w-full py-2 px-3 bg-platinum-900/50 dark:bg-outer_space-600/60 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-sm text-outer_space-500 dark:text-platinum-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500 font-medium"
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
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-french_gray-300/40 dark:border-payne's_gray-400/40">
            <span className="text-xs font-mono text-payne's_gray-500 dark:text-french_gray-400 mr-1 flex items-center gap-1">
              <Filter size={12} /> Tech Category:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                    isSelected
                      ? "bg-blue_munsell-500 text-white font-semibold shadow-sm"
                      : "bg-platinum-500/60 dark:bg-payne's_gray-400/40 text-outer_space-500 dark:text-platinum-400 hover:bg-french_gray-400/50 dark:hover:bg-payne's_gray-300/60"
                  }`}
                >
                  {cat}
                </button>
              )
            })}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto inline-flex items-center text-xs font-mono text-rose-500 hover:text-rose-400 transition-colors"
              >
                <X size={12} className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Results Counter */}
        <div className="flex justify-between items-center text-xs font-mono text-payne's_gray-500 dark:text-french_gray-400">
          <span>
            Showing <strong className="text-blue_munsell-500">{filteredProjects.length}</strong> of{" "}
            {initialProjects.length} projects
          </span>
          {hasActiveFilters && (
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
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
                className="group relative bg-white/90 dark:bg-outer_space-500/90 backdrop-blur-sm rounded-xl border border-french_gray-300 dark:border-payne's_gray-400 p-6 hover:shadow-xl hover:border-blue_munsell-500/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Color Dot, Category & Priority */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${project.color}`} />
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {project.category}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        project.priority === "High"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : project.priority === "Medium"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {project.priority} Prio
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-outer_space-500 dark:text-platinum-500 group-hover:text-blue_munsell-500 transition-colors mb-2">
                    {project.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-payne's_gray-500 dark:text-french_gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech Stack Tags (IT Theme) */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue_munsell-500/10 text-blue_munsell-600 dark:text-blue_munsell-300 border border-blue_munsell-500/20"
                      >
                        [{tech}]
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-payne's_gray-500 dark:text-french_gray-400">Completion</span>
                      <span className="text-outer_space-500 dark:text-platinum-400 font-semibold">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-french_gray-300/50 dark:bg-payne's_gray-400/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${project.color}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Meta Details */}
                  <div className="flex items-center justify-between pt-3 border-t border-french_gray-300/40 dark:border-payne's_gray-400/40 text-xs text-payne's_gray-500 dark:text-french_gray-400 font-mono">
                    <div className="flex items-center gap-3">
                      <span>👥 {project.members} dev</span>
                      <span>📋 {project.tasksCount} tasks</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        project.status === "In Progress"
                          ? "bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900/60 dark:text-blue_munsell-300"
                          : project.status === "Review"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                            : project.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
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
          /* Empty State when no projects match filters */
          <div className="text-center py-16 bg-white/60 dark:bg-outer_space-500/60 backdrop-blur-sm rounded-xl border border-dashed border-french_gray-300 dark:border-payne's_gray-400">
            <Code size={48} className="mx-auto text-payne's_gray-500 dark:text-french_gray-400 mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-outer_space-500 dark:text-platinum-500 mb-1">
              No matching projects found
            </h3>
            <p className="text-sm text-payne's_gray-500 dark:text-french_gray-400 mb-4">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg text-xs font-mono hover:bg-blue_munsell-600 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
