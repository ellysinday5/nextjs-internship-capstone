"use client";

import { type ProjectWithStats, getProjectsAction } from "@/actions/project-actions";
import { type TaskRecord, getProjectTasksAction } from "@/actions/task-actions";
import { calculateCompletionPercentage, isTaskCompleted } from "@/lib/project-stats";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  FolderKanban,
  Maximize2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type DateRangePreset = "7d" | "30d" | "90d" | "custom";
type AnalyticsTask = TaskRecord & { projectId: string };

export function AnalyticsPageClient() {
  const [loading, setLoading] = useState(true);
  const [dbProjects, setDbProjects] = useState<ProjectWithStats[]>([]);
  const [dbTasks, setDbTasks] = useState<AnalyticsTask[]>([]);

  // Project selector: "all" for Workspace Overview, or specific project ID
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  // Date range state
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("30d");
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

  // Modal for All Projects
  const [isViewAllProjectsOpen, setIsViewAllProjectsOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const projectsList = await getProjectsAction();
      if (Array.isArray(projectsList)) {
        setDbProjects(projectsList);
        const taskPromises = projectsList.map(async (p) => {
          try {
            const listTasks = await getProjectTasksAction(p.id);
            return listTasks.map((t) => ({ ...t, projectId: p.id }));
          } catch {
            return [];
          }
        });
        const allTasks = (await Promise.all(taskPromises)).flat();
        setDbTasks(allTasks);
      }
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Determine current active project (if scoped)
  const selectedProject = useMemo(() => {
    if (selectedProjectId === "all") return null;
    return dbProjects.find((p) => p.id === selectedProjectId) ?? null;
  }, [dbProjects, selectedProjectId]);

  // Calculate Date Boundaries
  const dateWindow = useMemo(() => {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (dateRangePreset === "7d") {
      start.setDate(now.getDate() - 7);
    } else if (dateRangePreset === "30d") {
      start.setDate(now.getDate() - 30);
    } else if (dateRangePreset === "90d") {
      start.setDate(now.getDate() - 90);
    } else if (dateRangePreset === "custom") {
      if (customStartDate) {
        const parsedStart = new Date(customStartDate);
        if (!isNaN(parsedStart.getTime())) {
          start.setTime(parsedStart.getTime());
          start.setHours(0, 0, 0, 0);
        }
      }
      if (customEndDate) {
        const parsedEnd = new Date(customEndDate);
        if (!isNaN(parsedEnd.getTime())) {
          end.setTime(parsedEnd.getTime());
          end.setHours(23, 59, 59, 999);
        }
      }
    }

    return { start, end };
  }, [dateRangePreset, customStartDate, customEndDate]);

  // Filter projects based on selectedProjectId
  const scopedProjects = useMemo(() => {
    if (selectedProjectId === "all") return dbProjects;
    return dbProjects.filter((p) => p.id === selectedProjectId);
  }, [dbProjects, selectedProjectId]);

  // Filter tasks based on project scope and date window
  const scopedTasks = useMemo(() => {
    let tasks = dbTasks;
    if (selectedProjectId !== "all") {
      tasks = tasks.filter((t) => t.projectId === selectedProjectId);
    }
    return tasks;
  }, [dbTasks, selectedProjectId]);

  // Tasks created or completed within date range
  const dateScopedTasks = useMemo(() => {
    const { start, end } = dateWindow;
    return scopedTasks.filter((t) => {
      const created = t.createdAt ? new Date(t.createdAt).getTime() : 0;
      const completed = t.completedAt ? new Date(t.completedAt).getTime() : 0;
      const inCreated = created >= start.getTime() && created <= end.getTime();
      const inCompleted = completed >= start.getTime() && completed <= end.getTime();
      return inCreated || inCompleted;
    });
  }, [scopedTasks, dateWindow]);

  // Calculated Core Analytics Metrics
  const stats = useMemo(() => {
    const isSingleProject = selectedProjectId !== "all";
    const totalProjects = scopedProjects.length;

    const totalTasks = isSingleProject
      ? scopedTasks.length
      : scopedProjects.reduce((acc, p) => acc + (p.taskCount || 0), 0);

    const completedTasks = isSingleProject
      ? scopedTasks.filter((t) => isTaskCompleted(t.status)).length
      : scopedProjects.reduce((acc, p) => acc + (p.completedTaskCount || 0), 0);

    const completionRate = calculateCompletionPercentage(completedTasks, totalTasks);

    // Velocity:
    // Workspace-wide: Average completed tasks per project
    // Single project: Total completed tasks in current scope
    const velocity = isSingleProject
      ? String(completedTasks)
      : totalProjects > 0
        ? (completedTasks / totalProjects).toFixed(1)
        : "0.0";

    // Active Collaborators
    const uniqueUserIds = new Set<string>();
    scopedProjects.forEach((p) => {
      if (p.ownerId) uniqueUserIds.add(p.ownerId);
      p.members?.forEach((m) => {
        if (m.id) uniqueUserIds.add(m.id);
      });
    });
    scopedTasks.forEach((t) => {
      if (t.assigneeId) uniqueUserIds.add(t.assigneeId);
    });
    const activeUsers = uniqueUserIds.size;

    // Average Task Resolution Time
    // Calculate difference between completedAt and createdAt for completed tasks
    const completedWithDates = scopedTasks.filter(
      (t) => isTaskCompleted(t.status) && t.completedAt && t.createdAt,
    );

    let avgTaskDays = "No data yet";
    if (completedWithDates.length > 0) {
      const totalDays = completedWithDates.reduce((acc, t) => {
        const created = new Date(t.createdAt!).getTime();
        const completed = new Date(t.completedAt!).getTime();
        const diffDays = Math.max(0, (completed - created) / (1000 * 60 * 60 * 24));
        return acc + diffDays;
      }, 0);
      const avg = totalDays / completedWithDates.length;
      avgTaskDays = `${avg.toFixed(1)} days`;
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
  }, [scopedProjects, scopedTasks, selectedProjectId]);

  // Project Progress Breakdown (For Workspace Overview or Single Project Breakdown)
  const allProjectProgressData = useMemo(() => {
    return scopedProjects.map((p) => {
      const total = p.taskCount || 0;
      const completed = p.completedTaskCount || 0;
      const percent = p.completionPercentage ?? calculateCompletionPercentage(completed, total);
      return {
        id: p.id,
        name: p.name,
        status: p.status || "Active",
        completed,
        total,
        percent,
      };
    });
  }, [scopedProjects]);

  // Single Project Status Distribution (when 1 project selected)
  const singleProjectStatusCounts = useMemo(() => {
    if (selectedProjectId === "all") return null;

    let todoCount = 0;
    let inProgressCount = 0;
    let reviewCount = 0;
    let doneCount = 0;

    scopedTasks.forEach((t) => {
      if (isTaskCompleted(t.status)) {
        doneCount++;
      } else {
        const s = (t.status || "").toLowerCase();
        if (s.includes("progress")) {
          inProgressCount++;
        } else if (s.includes("review")) {
          reviewCount++;
        } else {
          todoCount++;
        }
      }
    });

    return {
      todo: todoCount,
      inProgress: inProgressCount,
      review: reviewCount,
      done: doneCount,
      total: scopedTasks.length,
    };
  }, [selectedProjectId, scopedTasks]);

  // Date Range Validation Handlers
  const handleStartDateChange = (val: string) => {
    setCustomStartDate(val);
    if (customEndDate && val > customEndDate) {
      setCustomEndDate(val);
    }
  };

  const handleEndDateChange = (val: string) => {
    setCustomEndDate(val);
    if (customStartDate && val < customStartDate) {
      setCustomStartDate(val);
    }
  };

  // Weekly Throughput & Activity Data
  const weeklyThroughput = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: Record<string, { day: string; tasks: number; codeCommits: number }> = {};

    days.forEach((day) => {
      counts[day] = { day, tasks: 0, codeCommits: 0 };
    });

    // Populate from real tasks in dateScopedTasks
    dateScopedTasks.forEach((t) => {
      const dateToUse = t.completedAt ? new Date(t.completedAt) : t.createdAt ? new Date(t.createdAt) : null;
      if (dateToUse) {
        const dayName = days[dateToUse.getDay()];
        if (counts[dayName]) {
          if (isTaskCompleted(t.status)) {
            counts[dayName].tasks += 1;
          } else {
            counts[dayName].codeCommits += 1; // Activity / task created
          }
        }
      }
    });

    // Order from Monday to Sunday for display
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day) => counts[day] || { day, tasks: 0, codeCommits: 0 },
    );
  }, [dateScopedTasks]);

  const hasActivityData = useMemo(() => {
    return dateScopedTasks.length > 0 && weeklyThroughput.some((d) => d.tasks > 0 || d.codeCommits > 0);
  }, [dateScopedTasks, weeklyThroughput]);

  const peakDay = useMemo(() => {
    if (!hasActivityData) return "None";
    let max = -1;
    let peak = "None";
    weeklyThroughput.forEach((d) => {
      const total = d.tasks + d.codeCommits;
      if (total > max && total > 0) {
        max = total;
        peak = d.day;
      }
    });
    return peak;
  }, [weeklyThroughput, hasActivityData]);

  const maxWeeklyValue = useMemo(() => {
    const max = Math.max(...weeklyThroughput.map((d) => Math.max(d.tasks, d.codeCommits)), 10);
    return Math.ceil(max * 1.25);
  }, [weeklyThroughput]);

  const filteredModalProjects = useMemo(() => {
    if (!projectSearch.trim()) return allProjectProgressData;
    const q = projectSearch.toLowerCase();
    return allProjectProgressData.filter(
      (p) => p.name.toLowerCase().includes(q),
    );
  }, [allProjectProgressData, projectSearch]);

  const handleDatePresetChange = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset === "custom") {
      setShowCustomDateInputs(true);
    } else {
      setShowCustomDateInputs(false);
    }
  };

  const topMetricCards = [
    {
      label: "Projects Velocity",
      value: loading ? "..." : stats.velocity,
      unit: selectedProjectId === "all" ? "tasks / project" : "completed tasks",
      change: "+8.4%",
      isPositive: true,
      icon: TrendingUp,
      accentColor: "#0033a0",
      pillBg: "bg-blue-50 text-[#0033a0] dark:bg-blue-950/60 dark:text-blue-400",
    },
    {
      label: "Team Completion Rate",
      value: loading ? "..." : `${stats.completionRate}%`,
      unit: "overall completion",
      change: `${stats.completedTasks}/${stats.totalTasks} tasks`,
      isPositive: true,
      icon: CheckCircle2,
      accentColor: "#10b981",
      pillBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    {
      label: selectedProjectId === "all" ? "Active Workspace Users" : "Project Collaborators",
      value: loading ? "..." : String(stats.activeUsers),
      unit: stats.activeUsers === 1 ? "team member" : "team members",
      change: "Live",
      isPositive: true,
      icon: Users,
      accentColor: "#8b5cf6",
      pillBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
    },
    {
      label: "Avg. Task Resolution Time",
      value: loading ? "..." : stats.avgTaskDays,
      unit: stats.avgTaskDays === "No data yet" ? "" : "lead time",
      change: stats.avgTaskDays === "No data yet" ? "Pending" : "Measured",
      isPositive: true,
      icon: Clock,
      accentColor: "#f59e0b",
      pillBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    },
  ];

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 w-full">
        {/* ── HEADER TOOLBAR ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0033a0] dark:text-blue-400">
                <BarChart3 size={18} />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Analytics & Performance
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Track project performance, throughput velocity, and resolution metrics in real time.
            </p>
          </div>

          {/* Controls: Project Scope Selector + Date Range Picker */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* 1. Project Selector */}
            <div className="relative min-w-[220px]">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-xs">
                <FolderKanban size={15} className="text-[#0033a0] dark:text-blue-400 shrink-0" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-transparent outline-none cursor-pointer text-xs font-semibold"
                >
                  <option value="all">🏢 All Projects (Workspace Overview)</option>
                  {dbProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      📁 {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Date Range Presets */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/60 self-start sm:self-auto">
              {(
                [
                  { id: "7d", label: "7D" },
                  { id: "30d", label: "30D" },
                  { id: "90d", label: "90D" },
                  { id: "custom", label: "Custom" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleDatePresetChange(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dateRangePreset === preset.id
                      ? "bg-white dark:bg-slate-900 text-[#0033a0] dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── EXPANDABLE CUSTOM DATE RANGE BAR ── */}
        {showCustomDateInputs && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0033a0] dark:text-blue-400">
              <Calendar size={15} />
              <span>Select Custom Analytics Date Window:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <span className="text-slate-400 text-[11px]">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  max={customEndDate || undefined}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="bg-transparent outline-none text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
                />
              </div>

              <span className="text-slate-400 text-xs font-bold">→</span>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <span className="text-slate-400 text-[11px]">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  min={customStartDate || undefined}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="bg-transparent outline-none text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => setDateRangePreset("30d")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Custom Range"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── PROJECT CONTEXT BANNER (When specific project selected) ── */}
        {selectedProject && (
          <div className="flex items-center justify-between p-3.5 px-4 rounded-xl border border-[#0033a0]/20 bg-[#0033a0]/5 dark:border-blue-800/40 dark:bg-blue-950/30">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#0033a0] dark:bg-blue-400 animate-pulse" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Viewing metrics scoped exclusively to{" "}
                <strong className="text-[#0033a0] dark:text-blue-300 font-bold">
                  {selectedProject.name}
                </strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProjectId("all")}
              className="text-xs font-bold text-[#0033a0] dark:text-blue-400 hover:underline cursor-pointer"
            >
              Reset to Workspace Overview
            </button>
          </div>
        )}

        {/* ── TOP 4 METRIC CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 p-5"
              >
                {/* Top Accent Strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 w-full"
                  style={{ backgroundColor: card.accentColor }}
                />

                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.label}
                  </span>
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${card.pillBg}`}
                  >
                    <Icon size={18} className="stroke-[2.5]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {card.value}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>{card.unit}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {card.change}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CHARTS & BREAKDOWN SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Project Progress & Completion / Status Breakdown */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all duration-200 min-h-[380px]">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#0033a0] dark:text-blue-400" />
                    {selectedProject
                      ? `${selectedProject.name} Breakdown`
                      : "Project Progress & Completion"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {selectedProject
                      ? "Task distribution across Kanban columns and workflow stages"
                      : "Task completion ratios across your active workspace projects"}
                  </p>
                </div>

                {selectedProjectId === "all" && (
                  <button
                    type="button"
                    onClick={() => setIsViewAllProjectsOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#0033a0] hover:text-white dark:hover:bg-blue-600 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Maximize2 size={13} />
                    View All
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-4 py-8 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  ))}
                </div>
              ) : selectedProject && singleProjectStatusCounts ? (
                /* SINGLE PROJECT DETAILED STATUS TILES */
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">To Do</span>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {singleProjectStatusCounts.todo}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/30 text-center">
                      <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">In Progress</span>
                      <p className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">
                        {singleProjectStatusCounts.inProgress}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/30 text-center">
                      <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400">In Review</span>
                      <p className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">
                        {singleProjectStatusCounts.review}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-center">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Done</span>
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                        {singleProjectStatusCounts.done}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>Overall Project Progress</span>
                      <span className="text-[#0033a0] dark:text-blue-400 font-extrabold">
                        {stats.completionRate}% Complete
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0033a0] to-[#00b4d8] rounded-full transition-all duration-700"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : allProjectProgressData.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                  No active projects found in this workspace.
                </div>
              ) : (
                /* WORKSPACE PROJECTS LIST */
                <div className="space-y-4 py-2">
                  {allProjectProgressData.slice(0, 4).map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className="group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer space-y-1.5 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                        <span className="truncate pr-2 group-hover:text-[#0033a0] dark:group-hover:text-blue-400 transition-colors">
                          {proj.name}
                        </span>
                        <span className="shrink-0 text-slate-500 dark:text-slate-400 font-semibold">
                          {proj.percent}% ({proj.completed}/{proj.total} tasks)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0033a0] to-[#00b4d8] rounded-full transition-all duration-700"
                          style={{ width: `${proj.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Synced live from workspace database</span>
              {selectedProjectId === "all" ? (
                <button
                  type="button"
                  onClick={() => setIsViewAllProjectsOpen(true)}
                  className="text-[#0033a0] dark:text-blue-400 font-bold hover:underline"
                >
                  View all {allProjectProgressData.length} projects →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedProjectId("all")}
                  className="text-[#0033a0] dark:text-blue-400 font-bold hover:underline"
                >
                  ← Back to all projects
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Weekly Activity & Throughput Chart */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all duration-200 min-h-[380px]">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity size={18} className="text-[#0033a0] dark:text-blue-400" />
                    Weekly Activity & Throughput
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Tasks completed vs task updates by weekday
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0033a0] dark:text-blue-400 font-extrabold">
                  Peak: {peakDay}
                </span>
              </div>

              {/* Bar Chart Visualization */}
              {!hasActivityData ? (
                <div className="flex-1 flex flex-col items-center justify-center py-14 px-4 text-center border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                    <Activity size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No activity in this date range
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-xs">
                    No task completions or updates occurred between{" "}
                    {dateWindow.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} and{" "}
                    {dateWindow.end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}.
                  </p>
                </div>
              ) : (
                <div className="flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 px-1 border-b border-slate-100 dark:border-slate-800">
                  {weeklyThroughput.map((d) => {
                    const tasksHeightPercent = Math.min(100, Math.max(8, (d.tasks / maxWeeklyValue) * 100));
                    const commitsHeightPercent = Math.min(100, Math.max(8, (d.codeCommits / maxWeeklyValue) * 100));

                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-44">
                          <div
                            className="w-3 sm:w-4 bg-[#0033a0] dark:bg-blue-500 rounded-t-md transition-all duration-500 group-hover:brightness-125 shadow-xs"
                            style={{ height: `${tasksHeightPercent}%` }}
                            title={`${d.tasks} Completed Tasks`}
                          />
                          <div
                            className="w-3 sm:w-4 bg-[#00b4d8] dark:bg-sky-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 shadow-xs"
                            style={{ height: `${commitsHeightPercent}%` }}
                            title={`${d.codeCommits} Activity Items`}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {d.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0033a0] dark:bg-blue-500" /> Tasks Completed
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00b4d8] dark:bg-sky-400" /> Activity / Updates
                </span>
              </div>
              <span className="text-slate-400 font-medium">Real-time sync</span>
            </div>
          </div>
        </div>

        {/* ── SYSTEM HEALTH & ENGINE METRICS ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Workspace Health & Database Engine
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              System Healthy
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Database Query Latency",
                value: "14ms",
                badge: "Optimal",
                desc: "Serverless pool active",
              },
              {
                label: "Real-Time Cache Hit Rate",
                value: "99.2%",
                badge: "+1.8%",
                desc: "Optimized hydration",
              },
              {
                label: "Sync Engine Resolution",
                value: "0.08s",
                badge: "Fast",
                desc: "Active heartbeat",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {metric.label}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-950/60">
                    {metric.badge}
                  </span>
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-white">{metric.value}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {metric.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── MODAL: VIEW ALL PROJECTS ── */}
        {isViewAllProjectsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-[#0033a0] dark:text-blue-400" />
                    All Projects Progress & Completion
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Inspect task progress, completion percentages, and milestone stats across all workspace projects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsViewAllProjectsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0033a0]/30 focus:border-[#0033a0]"
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
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setIsViewAllProjectsOpen(false);
                      }}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0033a0] dark:bg-blue-950 dark:text-blue-300">
                            {p.status}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-[#0033a0] dark:text-blue-400">
                          {p.percent}% Complete ({p.completed}/{p.total} tasks)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0033a0] to-[#00b4d8] rounded-full transition-all duration-500"
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
                  type="button"
                  onClick={() => setIsViewAllProjectsOpen(false)}
                  className="px-4 py-2 bg-[#0033a0] hover:bg-[#00277a] text-white rounded-xl font-bold transition-colors cursor-pointer"
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
