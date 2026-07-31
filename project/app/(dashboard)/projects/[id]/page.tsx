"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Users,
  MoreHorizontal,
  Plus,
  LayoutGrid,
  List,
  UserCircle2,
  SlidersHorizontal,
} from "lucide-react";

/* Convert URL slug back to a readable title */
function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  assignee: string;
  tag?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

/* ─────────────────────────────────────────────────────────────
   Placeholder Board Data
───────────────────────────────────────────────────────────── */
const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "#6366f1",
    tasks: [
      { id: "t1", title: "Design homepage mockup", description: "Create initial design concepts", priority: "high", assignee: "J", tag: "Design" },
      { id: "t2", title: "Research competitors", description: "Analyze competitor websites", priority: "medium", assignee: "S", tag: "Research" },
      { id: "t3", title: "Define user personas", description: "Create detailed user personas", priority: "low", assignee: "M", tag: "UX" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "#f59e0b",
    tasks: [
      { id: "t4", title: "Develop navigation component", description: "Build responsive navigation bar", priority: "high", assignee: "A", tag: "Dev" },
      { id: "t5", title: "Content strategy planning", description: "Plan content structure and flow", priority: "medium", assignee: "T", tag: "Content" },
    ],
  },
  {
    id: "review",
    title: "In Review",
    color: "#8b5cf6",
    tasks: [
      { id: "t6", title: "Logo design options", description: "Present logo variations to stakeholders", priority: "high", assignee: "L", tag: "Design" },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "#10b981",
    tasks: [
      { id: "t7", title: "Project kickoff meeting", description: "Initial team meeting completed", priority: "medium", assignee: "J", tag: "Planning" },
      { id: "t8", title: "Requirements gathering", description: "All requirements collected and documented", priority: "high", assignee: "S", tag: "Planning" },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   Priority Badge
───────────────────────────────────────────────────────────── */
function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const map = {
    high: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${map[priority]}`}>
      {priority}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Assignee Avatar
───────────────────────────────────────────────────────────── */
function Avatar({ letter }: { letter: string }) {
  return (
    <div className="w-6 h-6 rounded-full bg-[#00b4d8] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
      {letter}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Task Card
───────────────────────────────────────────────────────────── */
function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-white dark:bg-[#0f1d31] rounded-xl border border-slate-200 dark:border-slate-700/60 p-3.5 shadow-sm hover:shadow-md hover:border-[#00b4d8]/40 transition-all duration-150 cursor-pointer group">
      {task.tag && (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-2">
          {task.tag}
        </span>
      )}
      <h4 className="text-sm font-semibold text-[#142843] dark:text-white mb-1 group-hover:text-[#00b4d8] transition-colors leading-snug">
        {task.title}
      </h4>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3 leading-relaxed line-clamp-2">
        {task.description}
      </p>
      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <Avatar letter={task.assignee} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Kanban Column
───────────────────────────────────────────────────────────── */
function KanbanColumn({ column }: { column: Column }) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-bold text-[#142843] dark:text-white">{column.title}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {column.tasks.length}
          </span>
        </div>
        <button
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Column options"
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* Divider accent */}
      <div className="h-0.5 rounded-full mb-3" style={{ backgroundColor: column.color, opacity: 0.5 }} />

      {/* Tasks */}
      <div className="flex flex-col gap-2.5 flex-1">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {/* Add task button */}
        <button
          type="button"
          className="w-full py-2.5 flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs font-semibold hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors mt-1"
        >
          <Plus size={13} />
          Add task
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   List View (simple table-style)
───────────────────────────────────────────────────────────── */
function ListView({ columns }: { columns: Column[] }) {
  const allTasks = columns.flatMap((col) =>
    col.tasks.map((t) => ({ ...t, status: col.title, statusColor: col.color }))
  );

  return (
    <div className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-5 py-3 bg-slate-50 dark:bg-[#0f1d31] border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <span>Task</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Assignee</span>
      </div>
      {allTasks.map((task) => (
        <div
          key={task.id}
          className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-[#1c304a] transition-colors cursor-pointer"
        >
          <div>
            <p className="text-sm font-semibold text-[#142843] dark:text-white">{task.title}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
          </div>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: `${task.statusColor}1a`, color: task.statusColor }}
          >
            {task.status}
          </span>
          <PriorityBadge priority={task.priority} />
          <Avatar letter={task.assignee} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Members Tab Placeholder
───────────────────────────────────────────────────────────── */
function MembersView() {
  const members = [
    { name: "John Doe", role: "Project Lead", avatar: "J", status: "Active" },
    { name: "Sarah Wilson", role: "Frontend Dev", avatar: "S", status: "Active" },
    { name: "Mike Johnson", role: "UX Designer", avatar: "M", status: "Active" },
    { name: "Anna Chen", role: "Backend Dev", avatar: "A", status: "Away" },
    { name: "Tom Brown", role: "Content Strategist", avatar: "T", status: "Offline" },
  ];
  const statusMap: Record<string, string> = {
    Active: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    Away: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    Offline: "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => (
        <div key={m.name} className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-[#00b4d8] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {m.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#142843] dark:text-white truncate">{m.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.role}</p>
            <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMap[m.status]}`}>
              {m.status}
            </span>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="bg-white dark:bg-[#14263e] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors"
      >
        <Plus size={16} />
        Invite Member
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Settings Tab Placeholder
───────────────────────────────────────────────────────────── */
function SettingsView({ projectId }: { projectId: string }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white dark:bg-[#14263e] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h3 className="text-base font-bold text-[#142843] dark:text-white">General Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Project ID</label>
            <p className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f1d31] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">{projectId}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Visibility</label>
            <select className="w-full py-2.5 px-3 bg-slate-50 dark:bg-[#1c304a] border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-[#142843] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00b4d8]">
              <option>Team — visible to all members</option>
              <option>Private — only you</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-800/40 p-6">
        <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 mb-1">Danger Zone</h3>
        <p className="text-xs text-rose-500 dark:text-rose-400/80 mb-4">These actions are irreversible. Please proceed with caution.</p>
        <button
          type="button"
          className="px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition-colors"
        >
          Delete Project
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab definitions
───────────────────────────────────────────────────────────── */
type Tab = "board" | "list" | "members" | "settings";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "list", label: "List", icon: List },
  { id: "members", label: "Members", icon: UserCircle2 },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

/* ─────────────────────────────────────────────────────────────
   Project Page
───────────────────────────────────────────────────────────── */
export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = use(params);
  const projectTitle = slugToTitle(slug);
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const [columns] = useState<Column[]>(initialColumns);

  return (
    <div className="space-y-0 -mt-2">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#142843] dark:hover:text-white hover:bg-white dark:hover:bg-[#14263e] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            aria-label="Back to projects"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#142843] dark:text-white leading-tight">
              {projectTitle}
            </h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#00b4d8] hover:bg-white dark:hover:bg-[#14263e] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            aria-label="Members"
            title="Members"
            onClick={() => setActiveTab("members")}
          >
            <Users size={18} />
          </button>
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#00b4d8] hover:bg-white dark:hover:bg-[#14263e] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            aria-label="Settings"
            title="Settings"
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#00b4d8] hover:bg-white dark:hover:bg-[#14263e] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            aria-label="More options"
          >
            <MoreHorizontal size={18} />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00b4d8] hover:bg-[#0096b8] text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            <Plus size={15} />
            Add Task
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700/60 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === id
                ? "border-[#00b4d8] text-[#00b4d8]"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#142843] dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "board" && (
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-5 min-w-max px-0.5 pt-0.5 pb-1">
            {columns.map((col) => (
              <KanbanColumn key={col.id} column={col} />
            ))}

            {/* Add column button */}
            <div className="flex-shrink-0 w-72 flex items-start pt-8">
              <button
                type="button"
                className="w-full py-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-sm font-semibold hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors"
              >
                <Plus size={15} />
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "list" && <ListView columns={columns} />}
      {activeTab === "members" && <MembersView />}
      {activeTab === "settings" && <SettingsView projectId={slug} />}
    </div>
  );
}
