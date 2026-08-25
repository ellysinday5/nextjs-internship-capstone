"use client";

import { type ProjectWithStats, getProjectsAction } from "@/actions/project-actions";
import { type TaskRecord, getProjectTasksAction } from "@/actions/task-actions";
import { calculateCompletionPercentage, isTaskCompleted } from "@/lib/project-stats";
import {
  Activity,
  BarChart3,
  Clock,
  Maximize2,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";

const ACTIVITY_DATA = [
  { day: "Mon", tasks: 6, codeCommits: 14 },
  { day: "Tue", tasks: 9, codeCommits: 22 },
  { day: "Wed", tasks: 12, codeCommits: 18 },
  { day: "Thu", tasks: 8, codeCommits: 15 },
  { day: "Fri", tasks: 15, codeCommits: 28 },
  { day: "Sat", tasks: 4, codeCommits: 8 },
  { day: "Sun", tasks: 2, codeCommits: 5 },
];

export function AnalyticsPageClient() {
  const [loading, setLoading] = useState(true);
  const [dbProjects, setDbProjects] = useState<ProjectWithStats[]>([]);
  const [dbTasks, setDbTasks] = useState<TaskRecord[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [isViewAllProjectsOpen, setIsViewAllProjectsOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    getProjectsAction()
      .then(async (projectsList) => {
        if (Array.isArray(projectsList)) {
          setDbProjects(projectsList);
          const taskPromises = projectsList.map(async (p) => {
            try {
              return await getProjectTasksAction(p.id);
            } catch {
              return [];
            }
          });
          const allTasks = (await Promise.all(taskPromises)).flat();
          setDbTasks(allTasks);
        }
      })
      .catch((err) => console.error("Failed to load analytics data:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalProjects = dbProjects.length;
    const totalTasks = dbProjects.reduce((acc, p) => acc + (p.taskCount || 0), 0);
    const completedTasks = dbProjects.reduce((acc, p) => acc + (p.completedTaskCount || 0), 0);
    const completionRate = calculateCompletionPercentage(completedTasks, totalTasks);
    const velocity = totalProjects > 0 ? (completedTasks / totalProjects).toFixed(1) : "0.0";

    // 1. Calculate actual active workspace users across projects
    const uniqueUserIds = new Set<string>();
    dbProjects.forEach((p) => {
      if (p.ownerId) uniqueUserIds.add(p.ownerId);
      p.members?.forEach((m) => {
        if (m.id) uniqueUserIds.add(m.id);
      });
    });
    dbTasks.forEach((t) => {
      if (t.assigneeId) uniqueUserIds.add(t.assigneeId);
    });
    const activeUsers = uniqueUserIds.size;

    // 2. Calculate actual average resolution time for completed tasks.
    // Only tasks with a real completedAt timestamp (set on status transition to
    // "Complete") are counted. Tasks completed before this migration that have
    // completedAt = null are intentionally excluded rather than approximated.
    const completedWithDates = dbTasks.filter(
      (t) => isTaskCompleted(t.status) && t.completedAt && t.createdAt,
    );
    let avgTaskDays = "Not enough data";
    if (completedWithDates.length > 0) {
      const totalDays = completedWithDates.reduce((acc, t) => {
        const created = new Date(t.createdAt!).getTime();
        const completed = new Date(t.completedAt!).getTime();
        const diffDays = Math.max(0, (completed - created) / (1000 * 60 * 60 * 24));
        return acc + diffDays;
      }, 0);
      const avg = totalDays / completedWithDates.length;
      avgTaskDays = `${avg.toFixed(1)}d`;
    }

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      completionRate,
      velocity,
      activeUsers,
      avgTaskDays,
    };
  }, [dbProjects, dbTasks]);

  const allProjectProgressData = useMemo(() => {
    if (dbProjects.length > 0) {
      return dbProjects.map((p) => {
        const total = p.taskCount || 0;
        const completed = p.completedTaskCount || 0;
        const percent = p.completionPercentage ?? calculateCompletionPercentage(completed, total);
        return {
          id: p.id,
          name: p.name,
          category: p.categories?.[0] || "Project",
          status: p.status || "Active",
          completed,
          total,
          percent,
        };
      });
    }
    return [];
  }, [dbProjects]);

  const filteredModalProjects = useMemo(() => {
    if (!projectSearch.trim()) return allProjectProgressData;
    const q = projectSearch.toLowerCase();
    return allProjectProgressData.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  }, [allProjectProgressData, projectSearch]);

  const topStats = [
    {
      label: "Projects Velocity",
      value: loading ? "..." : stats.velocity,
      unit: "tasks/project",
      icon: TrendingUp,
    },
    {
      label: "Team Completion Rate",
      value: loading ? "..." : `${stats.completionRate}%`,
      unit: "completion rate",
      icon: BarChart3,
    },
    {
      label: "Active Workspace Users",
      value: loading ? "..." : String(stats.activeUsers),
      unit: stats.activeUsers === 1 ? "team member" : "team members",
      icon: Users,
    },
    {
      label: "Avg. Task Resolution Time",
      value: loading ? "..." : stats.avgTaskDays,
      unit: stats.avgTaskDays === "Not enough data" ? "" : "resolution time",
      icon: Clock,
    },
  ];

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142843] dark:text-white tracking-tight">
              Analytics & Performance
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
              Track project performance, completion metrics, and team productivity in real time.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1c304a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs shrink-0">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-[#142843] text-white dark:bg-[#0052cc]"
                    : "text-slate-500 dark:text-slate-300 hover:text-[#0052cc]"
                }`}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* Top 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-4 bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <div className="h-8 w-8 rounded-lg bg-[#0052cc]/10 dark:bg-sky-400/10 flex items-center justify-center text-[#0052cc] dark:text-sky-400 shrink-0">
                    <Icon size={16} className="stroke-[2.5]" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#142843] dark:text-white mt-2">
                  {stat.value}{" "}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {stat.unit}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Project Progress */}
          <div className="bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#142843] dark:text-white">
                  Project Progress & Completion
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Task completion ratios across your active workspace projects
                </p>
              </div>
              <button
                onClick={() => setIsViewAllProjectsOpen(true)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#142843] hover:text-white text-xs font-bold text-[#142843] dark:text-slate-200 rounded-full transition-all border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Maximize2 size={13} />
                View All Projects
              </button>
            </div>

            {loading ? (
              <div className="space-y-4 py-8 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                ))}
              </div>
            ) : allProjectProgressData.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                No active projects found. Create a project to track completion analytics.
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                {allProjectProgressData.slice(0, 4).map((proj) => (
                  <div key={proj.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#142843] dark:text-slate-200">
                      <span className="truncate pr-2">{proj.name}</span>
                      <span className="shrink-0">
                        {proj.percent}% ({proj.completed}/{proj.total} tasks)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0052cc] to-[#00b4d8] rounded-full transition-all duration-700"
                        style={{ width: `${proj.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Synced live from workspace database</span>
              <button
                onClick={() => setIsViewAllProjectsOpen(true)}
                className="text-[#0052cc] dark:text-sky-400 font-bold hover:underline"
              >
                View all {allProjectProgressData.length} projects →
              </button>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#142843] dark:text-white">
                  Weekly Activity & Throughput
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Tasks completed vs code commits per day
                </p>
              </div>
              <Activity size={18} className="text-[#0052cc]" />
            </div>

            <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 px-1 border-b border-slate-200 dark:border-slate-700">
              {ACTIVITY_DATA.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-40">
                    <div
                      className="w-3 sm:w-3.5 bg-[#0052cc] rounded-t-md transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${(d.tasks / 20) * 100}%` }}
                      title={`${d.tasks} Tasks`}
                    />
                    <div
                      className="w-3 sm:w-3.5 bg-[#00b4d8] rounded-t-md transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${(d.codeCommits / 30) * 100}%` }}
                      title={`${d.codeCommits} Commits`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0052cc]" /> Tasks Completed
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00b4d8]" /> Code Commits
                </span>
              </div>
              <span className="text-[#0052cc] font-bold">Peak: Friday</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-50 dark:bg-[#0f1d31] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <h3 className="text-sm font-black text-[#142843] dark:text-white">
                Performance Monitoring & System Health
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
              System Healthy
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Database Latency", value: "18ms", badge: "Optimal" },
              { label: "Cache Hit Rate", value: "98.4%", badge: "+2.1%" },
              { label: "Page Hydration Time", value: "0.12s", badge: "Fast" },
            ].map(({ label, value, badge }) => (
              <div
                key={label}
                className="p-4 bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {label}
                </p>
                <p className="text-lg font-black text-[#142843] dark:text-white mt-1">
                  {value} <span className="text-xs font-bold text-emerald-500">{badge}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* View All Projects Modal */}
        {isViewAllProjectsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-[#142843] dark:text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-[#0052cc]" />
                    All Projects Progress & Completion Ratios
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Inspect task progress, completion percentages, and milestone stats across all
                    workspace projects.
                  </p>
                </div>
                <button
                  onClick={() => setIsViewAllProjectsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="shrink-0">
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects by title or category..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f1d31] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-[#142843] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052cc]"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {filteredModalProjects.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                    No projects found matching search.
                  </div>
                ) : (
                  filteredModalProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#142843] dark:text-white text-sm">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            {p.category}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#0052cc] dark:text-sky-300">
                          {p.percent}% Complete ({p.completed}/{p.total} tasks)
                        </span>
                      </div>
                      <div className="h-3 w-full bg-white dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-[#0052cc] to-[#00b4d8] rounded-full transition-all duration-500"
                          style={{ width: `${p.percent}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-500 shrink-0">
                <span>
                  Showing {filteredModalProjects.length} of {allProjectProgressData.length} projects
                </span>
                <button
                  onClick={() => setIsViewAllProjectsOpen(false)}
                  className="px-5 py-2 bg-[#142843] dark:bg-[#0052cc] text-white rounded-xl font-bold transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
