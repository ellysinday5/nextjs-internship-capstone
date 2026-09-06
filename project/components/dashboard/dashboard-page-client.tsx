"use client";

import { getRecentNotificationsAction } from "@/actions/notification-actions";
import { type ProjectWithStats, getProjectsAction } from "@/actions/project-actions";
import {
  type BatchedProjectTaskRecord,
  getTasksForProjectsAction,
} from "@/actions/task-actions";
import { AddMemberModal } from "@/components/modals/add-member-modal";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { StatCard } from "@/components/ui/stat-card";
import { isTaskCompleted } from "@/lib/project-stats";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  FolderPlus,
  ListPlus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PRIORITY_COLOR: Record<string, string> = {
  High: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  Urgent: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Low: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

const AVATAR_COLORS = [
  "bg-[#0033a0] text-white",
  "bg-emerald-600 text-white",
  "bg-violet-600 text-white",
  "bg-amber-600 text-white",
  "bg-cyan-600 text-white",
  "bg-rose-600 text-white",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatRelativeTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDueDate(dueDateInput: Date | string): { text: string; overdue: boolean } {
  const due = new Date(dueDateInput);
  const now = new Date();
  // Set both to start of day for comparison
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const overdue = dueMidnight.getTime() < todayMidnight.getTime();
  const diffDays = Math.round((dueMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

  let text = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (diffDays === 0) {
    text = "Due Today";
  } else if (diffDays === 1) {
    text = "Due Tomorrow";
  } else if (overdue) {
    text = `Overdue · ${text}`;
  } else {
    text = `Due ${text}`;
  }

  return { text, overdue };
}

interface ProjectOption {
  id: string;
  name: string;
}

interface ActivityItem {
  id: string;
  userName: string;
  userInitials: string;
  action: string;
  target: string;
  time: string;
  color: string;
  href?: string | null;
}

interface DeadlineItem {
  id: string;
  title: string;
  projectName: string;
  projectId: string;
  dueText: string;
  priority: string;
  overdue: boolean;
}

export function DashboardPageClient() {
  const router = useRouter();
  const { user } = useUser();
  const [modal, setModal] = useState<"project" | "member" | "task" | null>(null);
  const [dbProjects, setDbProjects] = useState<ProjectWithStats[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  const emailPrefix = email ? email.split("@")[0] : "";
  const greetingName = user?.firstName || user?.fullName || user?.username || emailPrefix || "User";

  useEffect(() => {
    let isMounted = true;
    setLoadingData(true);

    Promise.all([
      getProjectsAction(),
      getRecentNotificationsAction(8),
    ])
      .then(async ([projects, notificationsRes]) => {
        if (!isMounted) return;

        setDbProjects(projects);
        setProjectOptions(projects.map((p) => ({ id: p.id, name: p.name })));

        // 1. Process Real Recent Activity from workspace notifications
        if (notificationsRes?.success && Array.isArray(notificationsRes.data)) {
          const mappedActivities: ActivityItem[] = notificationsRes.data.map((n) => {
            const rawName = n.actor?.name || "Workspace Member";
            const initials = rawName
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase() || "WM";

            return {
              id: n.id,
              userName: rawName,
              userInitials: initials,
              action: n.title || "activity in",
              target: n.message || "workspace updates",
              time: formatRelativeTime(n.createdAt),
              color: getAvatarColor(rawName),
              href: n.href,
            };
          });
          setActivities(mappedActivities);
        }

        // 2. Process Real Upcoming Deadlines (batched across all workspace projects)
        const projectIds = projects.map((p) => p.id);
        if (projectIds.length > 0) {
          const allTasks: BatchedProjectTaskRecord[] = await getTasksForProjectsAction(projectIds);
          
          if (!isMounted) return;

          // Filter out completed tasks using canonical isTaskCompleted helper
          const activeTasksWithDates = allTasks.filter(
            (t) => t.dueDate && !isTaskCompleted(t.status)
          );

          // Sort by due date ascending
          activeTasksWithDates.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return dateA - dateB;
          });

          // Top 5 upcoming deadlines
          const mappedDeadlines: DeadlineItem[] = activeTasksWithDates.slice(0, 5).map((t) => {
            const { text, overdue } = formatDueDate(t.dueDate!);
            return {
              id: t.id,
              title: t.title,
              projectName: t.projectName,
              projectId: t.projectId,
              dueText: text,
              priority: t.priority || "Medium",
              overdue,
            };
          });

          setDeadlines(mappedDeadlines);
        } else {
          setDeadlines([]);
        }
      })
      .catch((err) => {
        console.error("[Dashboard] Error loading data:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalProjects = dbProjects.length;
  const totalTasks = dbProjects.reduce((acc, p) => acc + (p.taskCount || 0), 0);
  const completedTasks = dbProjects.reduce((acc, p) => acc + (p.completedTaskCount || 0), 0);
  const pendingTasks = Math.max(0, totalTasks - completedTasks);

  const dynamicStats = [
    {
      name: "Active Projects",
      value: totalProjects,
      icon: TrendingUp,
      accentColor: "#0033a0",
      color: "text-[#0033a0] dark:text-blue-400",
      pillBg: "bg-blue-50 text-[#0033a0] dark:bg-blue-950/60 dark:text-blue-400",
    },
    {
      name: "Total Tasks",
      value: totalTasks,
      icon: Users,
      accentColor: "#6c7fd8",
      color: "text-[#6c7fd8] dark:text-indigo-400",
      pillBg: "bg-indigo-50 text-[#6c7fd8] dark:bg-indigo-950/60 dark:text-indigo-400",
    },
    {
      name: "Completed Tasks",
      value: completedTasks,
      icon: CheckCircle2,
      accentColor: "#059669",
      color: "text-emerald-600 dark:text-emerald-400",
      pillBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    {
      name: "Pending Tasks",
      value: pendingTasks,
      icon: Clock,
      accentColor: "#d97706",
      color: "text-amber-600 dark:text-amber-400",
      pillBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    },
  ];

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <CreateProjectModal isOpen={modal === "project"} onClose={() => setModal(null)} />
      <AddMemberModal
        isOpen={modal === "member"}
        projectOptions={projectOptions}
        onClose={() => setModal(null)}
      />
      <CreateTaskModal isOpen={modal === "task"} onClose={() => setModal(null)} />

      <div className="space-y-6 w-full">
        {/* ── 1. Clean Header (search & export removed) ── */}
        <div className="bg-white dark:bg-[#14263e] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#142843] dark:text-white tracking-tight">
            Hello, {greetingName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your workspace overview and team activity for today.
          </p>
        </div>

        {/* ── 2. Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {dynamicStats.map((stat) => (
            <StatCard
              key={stat.name}
              label={stat.name}
              value={stat.value}
              icon={stat.icon}
              accentColor={stat.accentColor}
              color={stat.color}
              pillBg={stat.pillBg}
            />
          ))}
        </div>

        {/* ── 3. Projects + Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Projects (Refined compact container & palette) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-base font-bold text-[#142843] dark:text-white">
                  Recent Projects
                </h2>
                <Link
                  href="/projects"
                  className="text-xs font-bold text-[#0033a0] dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  View All <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="space-y-2.5">
                {dbProjects.length === 0 ? (
                  <div className="py-7 text-center text-xs text-slate-400 font-semibold bg-slate-50 dark:bg-[#182c47] rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    No projects yet. Create your first project to get started!
                  </div>
                ) : (
                  dbProjects.slice(0, 3).map((p) => {
                    const percent = p.completionPercentage ?? 0;
                    const updatedText = p.updatedAt
                      ? new Date(p.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently";

                    return (
                      <Link
                        key={p.id}
                        href={`/projects/${p.id}`}
                        className="bg-slate-50/80 dark:bg-[#182c47] border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#0033a0]/40 dark:hover:border-sky-500/40 hover:bg-white dark:hover:bg-[#1f3757] transition-all cursor-pointer block group shadow-2xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#142843] dark:text-white text-sm truncate group-hover:text-[#0033a0] dark:group-hover:text-sky-300 transition-colors">
                              {p.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0033a0]/10 text-[#0033a0] dark:bg-[#0033a0]/30 dark:text-sky-300 font-bold shrink-0">
                              {p.status || "In Progress"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Updated {updatedText} · {p.memberCount || 1} members · {p.taskCount || 0} tasks
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-[#0033a0] dark:text-sky-400">
                            {percent}%
                          </span>
                          <div className="w-24 sm:w-28 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#0033a0] to-[#0066cc] dark:from-sky-500 dark:to-blue-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Redesign (2x2 Grid with + Add Event) */}
          <div className="bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold text-[#142843] dark:text-white">Quick Actions</h2>
              <span className="text-[11px] font-semibold text-slate-400">Shortcuts</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 flex-1">
              {/* Action 1: Create Project */}
              <Link
                href="/projects/create"
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-[#182c47] hover:border-[#0033a0]/50 hover:bg-[#0033a0]/5 dark:hover:bg-[#0033a0]/15 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0033a0]/10 text-[#0033a0] dark:bg-[#0033a0]/25 dark:text-sky-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FolderPlus size={17} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142843] dark:text-white block group-hover:text-[#0033a0] dark:group-hover:text-sky-300 transition-colors">
                    New Project
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Start workspace project</span>
                </div>
              </Link>

              {/* Action 2: Add Team Member */}
              <button
                type="button"
                onClick={() => setModal("member")}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-[#182c47] hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between group cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <UserPlus size={17} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142843] dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Add Member
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Invite teammates</span>
                </div>
              </button>

              {/* Action 3: Create Task */}
              <button
                type="button"
                onClick={() => setModal("task")}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-[#182c47] hover:border-violet-500/50 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all flex flex-col justify-between group cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ListPlus size={17} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142843] dark:text-white block group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Create Task
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Assign work item</span>
                </div>
              </button>

              {/* Action 4: Add Event (Calendar) */}
              <button
                type="button"
                onClick={() => router.push("/calendar/new")}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-[#182c47] hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all flex flex-col justify-between group cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <CalendarPlus size={17} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142843] dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Add Event
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Schedule calendar</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. Real Activity + Real Upcoming Deadlines ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Activity (Real workspace data) */}
          <div className="bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={17} className="text-[#0033a0] dark:text-sky-400" />
              <h2 className="text-base font-bold text-[#142843] dark:text-white">
                Recent Activity
              </h2>
            </div>

            <div className="space-y-3 flex-1">
              {activities.length > 0 ? (
                activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#182c47] transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg ${a.color} flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 shadow-2xs`}
                    >
                      {a.userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#142843] dark:text-slate-200 leading-relaxed">
                        <span className="font-bold">{a.userName}</span>{" "}
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {a.action}
                        </span>{" "}
                        <span className="font-semibold text-[#0033a0] dark:text-sky-300">
                          {a.target}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center rounded-xl bg-slate-50/50 dark:bg-[#182c47]/50 border border-dashed border-slate-200 dark:border-slate-700/70">
                  <Activity size={22} className="mx-auto mb-1.5 text-slate-400 opacity-60" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No recent activity yet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Actions taken in this workspace will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines (Real task & project dates) */}
          <div className="bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={17} className="text-[#d97706]" />
              <h2 className="text-base font-bold text-[#142843] dark:text-white">
                Upcoming Deadlines
              </h2>
            </div>

            <div className="space-y-2.5 flex-1">
              {deadlines.length > 0 ? (
                deadlines.map((d) => (
                  <Link
                    key={d.id}
                    href={`/projects/${d.projectId}`}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-2xs ${
                      d.overdue
                        ? "bg-red-50/70 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/50 hover:border-red-300"
                        : "bg-slate-50/70 dark:bg-[#182c47] border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p
                        className={`text-xs font-bold truncate ${
                          d.overdue ? "text-red-700 dark:text-red-400" : "text-[#142843] dark:text-white"
                        }`}
                      >
                        {d.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-400 truncate">
                          {d.projectName}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                        <span
                          className={`text-[11px] font-semibold ${
                            d.overdue
                              ? "text-red-600 dark:text-red-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {d.dueText}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold border shrink-0 ${
                        PRIORITY_COLOR[d.priority] || PRIORITY_COLOR.Medium
                      }`}
                    >
                      {d.priority}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="py-10 text-center rounded-xl bg-slate-50/50 dark:bg-[#182c47]/50 border border-dashed border-slate-200 dark:border-slate-700/70">
                  <Calendar size={22} className="mx-auto mb-1.5 text-slate-400 opacity-60" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No upcoming deadlines
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    You are all caught up! Scheduled task deadlines will show here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
