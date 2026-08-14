"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Upload,
  Activity,
  AlertCircle,
  ArrowUpRight,
  Plus,
} from "lucide-react";

import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { AddMemberModal } from "@/components/modals/add-member-modal";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { getProjectsAction } from "@/actions/project-actions";

/* ─── Stat cards data ────────────────────────────────── */
const stats = [
  {
    name: "Active Projects",
    value: "12",
    change: "+2.5%",
    icon: TrendingUp,
    color: "bg-[#54c5d0]",
  },
  { name: "Team Members", value: "24", change: "+4.1%", icon: Users, color: "bg-[#6c7fd8]" },
  {
    name: "Completed Tasks",
    value: "156",
    change: "+12.3%",
    icon: CheckCircle2,
    color: "bg-[#52cba3]",
  },
  {
    name: "Pending Tasks",
    value: "43",
    change: "-2.1%",
    icon: Clock,
    color: "bg-[#e98c6a]",
    highlight: true,
  },
];

/* ─── Recent projects data ───────────────────────────── */
const recentProjects = [
  {
    id: 1,
    name: "Website Redesign",
    updated: "2 hours ago",
    progress: 75,
    members: 4,
    status: "In Progress",
  },
  {
    id: 2,
    name: "Mobile App v2.0",
    updated: "5 hours ago",
    progress: 85,
    members: 6,
    status: "In Progress",
  },
  {
    id: 3,
    name: "API Integration",
    updated: "1 day ago",
    progress: 60,
    members: 3,
    status: "In Progress",
  },
];

const activities = [
  {
    id: 1,
    user: "Alice",
    action: "created task",
    target: "Fix login bug",
    time: "5 min ago",
    color: "bg-blue-500",
  },
  {
    id: 2,
    user: "Bob",
    action: "completed",
    target: "API docs update",
    time: "20 min ago",
    color: "bg-green-500",
  },
  {
    id: 3,
    user: "Clara",
    action: "joined project",
    target: "Mobile App v2.0",
    time: "1 hr ago",
    color: "bg-purple-500",
  },
  {
    id: 4,
    user: "Dave",
    action: "commented on",
    target: "Website Redesign",
    time: "2 hr ago",
    color: "bg-orange-500",
  },
];

/* ─── Upcoming deadlines ─────────────────────────────── */
const deadlines = [
  { id: 1, task: "Q3 Report Draft", due: "Jul 30", priority: "High", overdue: false },
  { id: 2, task: "Design Review", due: "Jul 28", priority: "Medium", overdue: false },
  { id: 3, task: "API Endpoint Specs", due: "Jul 26", priority: "High", overdue: true },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface ProjectOption {
  id: string;
  name: string;
}

/* ═══════════════════════════════════════════════════════
   Main Dashboard Page
═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"project" | "member" | "task" | null>(null);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);

  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  const emailPrefix = email ? email.split("@")[0] : "";
  const greetingName = user?.firstName || user?.fullName || user?.username || emailPrefix || "User";

  // Fetch the user's real projects so the "Add Team Member" modal has
  // somewhere real to invite people into.
  useEffect(() => {
    getProjectsAction().then((projects) => {
      setProjectOptions(projects.map((p) => ({ id: p.id, name: p.name })));
    });
  }, []);

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      {/* ── Modals ── */}
      <CreateProjectModal isOpen={modal === "project"} onClose={() => setModal(null)} />
      <AddMemberModal
        isOpen={modal === "member"}
        projectOptions={projectOptions}
        onClose={() => setModal(null)}
      />
      <CreateTaskModal isOpen={modal === "task"} onClose={() => setModal(null)} />

      <div className="space-y-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#14263e] p-5 rounded-2xl border-2 border-[#142843]/20 dark:border-slate-700 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#142843] dark:text-white">
              Hello, {greetingName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here is your workspace overview and team activity for today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, tasks..."
                className="w-full pl-4 pr-10 py-2.5 bg-[#f0f4f8] dark:bg-[#1c304a] border border-[#142843]/20 dark:border-slate-600 rounded-xl text-sm text-[#142843] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0052cc] transition-colors"
                suppressHydrationWarning
              />
              <Search
                size={17}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#142843] hover:bg-[#1c304a] text-white rounded-xl text-sm font-bold transition-colors shadow-xs shrink-0"
              suppressHydrationWarning
            >
              <Upload size={15} />
              Export
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className={`group bg-white dark:bg-[#14263e] border-2 border-[#142843]/20 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between shadow-sm cursor-default
                transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-lg hover:-translate-y-0.5
                ${stat.highlight ? "ring-2 ring-purple-400/50" : ""}`}
            >
              <div className="space-y-1.5">
                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.name}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#142843] dark:text-white">
                    {stat.value}
                  </span>
                  <span
                    className={`text-xs font-bold flex items-center gap-0.5 ${stat.change.startsWith("+") ? "text-emerald-500" : "text-red-400"}`}
                  >
                    <ArrowUpRight
                      size={13}
                      className={stat.change.startsWith("-") ? "rotate-180" : ""}
                    />
                    {stat.change}
                  </span>
                </div>
              </div>
              <div
                className={`w-13 h-13 rounded-2xl ${stat.color} flex items-center justify-center shadow-md shrink-0 ml-3 transition-transform duration-200 group-hover:scale-110`}
              >
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid: Projects + Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white dark:bg-[#14263e] border-2 border-[#142843]/20 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#142843] dark:text-white">Recent Projects</h2>
              <Link
                href="/projects"
                className="text-xs font-bold text-[#0052cc] dark:text-[#54c5d0] hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#263852] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#2e4264] transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm truncate">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3151b7]/50 text-[#a5b4fc] font-semibold shrink-0">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Updated {p.updated} · {p.members} members
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-[#54c5d0]">{p.progress}%</span>
                    <div className="w-28 bg-[#142843] h-2.5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="bg-gradient-to-r from-[#00b4d8] to-[#54c5d0] h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions – 1/3 width */}
          <div className="bg-white dark:bg-[#14263e] border-2 border-[#142843]/20 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#142843] dark:text-white">Quick Actions</h2>
            <div className="space-y-3 flex-1">
              <Link
                href="/projects/create"
                className="w-full py-3.5 px-4 bg-[#0052cc] hover:bg-[#003d99] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                suppressHydrationWarning
              >
                <Plus size={17} />
                Create New Project
              </Link>
              <button
                onClick={() => setModal("member")}
                className="w-full py-3.5 px-4 bg-[#f0f4f8] dark:bg-[#1c304a] border-2 border-[#142843]/20 dark:border-slate-600 text-[#142843] dark:text-slate-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#dce6f0] dark:hover:bg-[#253d5c] transition-all hover:scale-[1.02] active:scale-[0.98]"
                suppressHydrationWarning
              >
                <Plus size={16} />
                Add Team Member
              </button>
              <button
                onClick={() => setModal("task")}
                className="w-full py-3.5 px-4 bg-[#f0f4f8] dark:bg-[#1c304a] border-2 border-[#142843]/20 dark:border-slate-600 text-[#142843] dark:text-slate-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#dce6f0] dark:hover:bg-[#253d5c] transition-all hover:scale-[1.02] active:scale-[0.98]"
                suppressHydrationWarning
              >
                <Plus size={16} />
                Create Task
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Grid: Activity + Deadlines ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-[#14263e] border-2 border-[#142843]/20 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-[#0052cc] dark:text-[#54c5d0]" />
              <h2 className="text-lg font-bold text-[#142843] dark:text-white">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${a.color} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}
                  >
                    {a.user[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#142843] dark:text-slate-200">
                      <span className="font-bold">{a.user}</span>{" "}
                      <span className="text-slate-500 dark:text-slate-400">{a.action}</span>{" "}
                      <span className="font-semibold text-[#0052cc] dark:text-[#54c5d0]">
                        {a.target}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-[#14263e] border-2 border-[#142843]/20 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-[#e98c6a]" />
              <h2 className="text-lg font-bold text-[#142843] dark:text-white">
                Upcoming Deadlines
              </h2>
            </div>
            <div className="space-y-3">
              {deadlines.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-colors ${
                    d.overdue
                      ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50"
                      : "bg-[#f0f4f8] dark:bg-[#1c304a] border-[#142843]/10 dark:border-slate-700"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${d.overdue ? "text-red-700 dark:text-red-400" : "text-[#142843] dark:text-white"}`}
                    >
                      {d.task}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${d.overdue ? "text-red-500 font-medium" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {d.overdue ? "Overdue · " : ""}
                      {d.due}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${priorityColor[d.priority]}`}
                  >
                    {d.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}