"use client";

import React, { use, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { TaskDetailsPane, TaskItem } from "@/components/tasks/task-details";
import { ProjectHeader } from "@/components/projects/details/project-header";
import { ProjectTabs } from "@/components/projects/details/project-tabs";
import { ProjectToolbar } from "@/components/projects/details/project-toolbar";
import { OverviewTab } from "@/components/projects/details/overview-tab";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import type { TaskRecord } from "@/actions/task-actions";
import { TimelineTab } from "@/components/projects/details/timeline-tab";
import { DashboardTab } from "@/components/projects/details/dashboard-tab";
import { CalendarTab } from "@/components/projects/details/calendar-tab";
import { ProjectStatusType } from "@/components/projects/details/types";
import { useProjectTitle } from "@/context/project-title-context";
import { useBoardStore } from "@/stores/board-store";
import { buildSectionsFromBoard } from "@/lib/board-to-sections";
import { ProjectDetailSkeleton, OverviewTabSkeleton, ListTabSkeleton, TimelineTabSkeleton, DashboardTabSkeleton, CalendarTabSkeleton } from "@/components/projects/details/skeleton-loading";
import { getProjectBySlugAction } from "@/actions/project-actions";
import { getProjectMembersAction, type ProjectMember } from "@/actions/member-actions";
import { AddMemberModal } from "@/components/modals/add-member-modal";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { loadProjectMeta, saveProjectMeta } from "@/lib/project-meta";

function slugToTitle(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = use(params);
  const initialTitle = slugToTitle(slug);

  const [resolvedProjectId, setResolvedProjectId] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [isResolvingProject, setIsResolvingProject] = useState(true);

  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const { setProjectTitle: setContextTitle } = useProjectTitle();
  useEffect(() => {
    setContextTitle(projectTitle);
    return () => setContextTitle(null);
  }, [projectTitle, setContextTitle]);

  useEffect(() => {
    getProjectBySlugAction(slug).then((project) => {
      if (!project) {
        setResolveError("Project not found.");
        setIsResolvingProject(false);
        return;
      }
      setResolvedProjectId(project.id);
      setProjectTitle(project.name);
      // Hydrate per-project customizations from localStorage
      const saved = loadProjectMeta(project.id);
      if (saved) {
        setProjectColor(saved.color);
        setSelectedIconIndex(saved.iconIndex);
        setIsFavorite(saved.isFavorite);
      }
      setIsResolvingProject(false);
    });
  }, [slug]);

  // ── Board store ──
  const {
    lists,
    tasks,
    isLoading,
    loadProject,
    createTask,
    updateTask,
    deleteTask,
    createList,
  } = useBoardStore();

  useEffect(() => {
    if (resolvedProjectId) loadProject(resolvedProjectId);
  }, [resolvedProjectId, loadProject]);

  const sections = useMemo(() => buildSectionsFromBoard(lists, tasks), [lists, tasks]);

  // ── Members ──
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const fetchMembers = useCallback(async () => {
    if (!resolvedProjectId) return;
    const data = await getProjectMembersAction(resolvedProjectId);
    setMembers(data);
  }, [resolvedProjectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ── Tabs ──
  const [availableTabs, setAvailableTabs] = useState<string[]>([
    "List", "Board", "Table", "Form", "Timeline", "Dashboard", "Calendar",
  ]);
  const [activeTab, setActiveTab] = useState("List");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<
    "default" | "name" | "priority" | "assignee" | "dueDate" | "startDate" |
    "dateCreated" | "dateUpdated" | "dateClosed" | "timeTracked" | "timeEstimate" |
    "totalTimeInStatus" | "duration"
  >("default");
  // Table tab: show/hide completed tasks via the Closed toggle
  const [showClosedTasks, setShowClosedTasks] = useState(false);

  // ── Table view persistence ──
  type TableViewState = {
    searchQuery: string;
    selectedPriorityFilter: string;
    selectedStatusFilter: string;
    sortBy: string;
    showClosedTasks: boolean;
  };

  const tableViewKey = resolvedProjectId ? `syntraflow_table_view_${resolvedProjectId}` : null;
  const autosaveKey = resolvedProjectId ? `syntraflow_table_autosave_${resolvedProjectId}` : null;

  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const [savedView, setSavedView] = useState<TableViewState | null>(null);

  // Load saved view + autosave pref on mount
  useEffect(() => {
    if (!tableViewKey || !autosaveKey) return;
    try {
      const stored = localStorage.getItem(tableViewKey);
      if (stored) {
        const v: TableViewState = JSON.parse(stored);
        setSearchQuery(v.searchQuery ?? "");
        setSelectedPriorityFilter(v.selectedPriorityFilter ?? "All");
        setSelectedStatusFilter(v.selectedStatusFilter ?? "All");
        setSortBy((v.sortBy as any) ?? "default");
        setShowClosedTasks(v.showClosedTasks ?? false);
        setSavedView(v);
      }
      const as = localStorage.getItem(autosaveKey);
      if (as === "true") setAutosaveEnabled(true);
    } catch {}
  }, [tableViewKey, autosaveKey]);

  const currentTableView = useCallback((): TableViewState => ({
    searchQuery,
    selectedPriorityFilter,
    selectedStatusFilter,
    sortBy,
    showClosedTasks,
  }), [searchQuery, selectedPriorityFilter, selectedStatusFilter, sortBy, showClosedTasks]);

  const handleSaveView = useCallback(() => {
    if (!tableViewKey) return;
    const v = currentTableView();
    try { localStorage.setItem(tableViewKey, JSON.stringify(v)); } catch {}
    setSavedView(v);
  }, [tableViewKey, currentTableView]);

  const handleEnableAutosave = useCallback(() => {
    if (!autosaveKey) return;
    const next = !autosaveEnabled;
    setAutosaveEnabled(next);
    try { localStorage.setItem(autosaveKey, String(next)); } catch {}
    if (next) handleSaveView(); // save immediately when turning on
  }, [autosaveKey, autosaveEnabled, handleSaveView]);

  const handleSaveAsNewView = useCallback(() => {
    // Same as save view — persists current state
    handleSaveView();
  }, [handleSaveView]);

  const handleRevertClosedTasks = useCallback(() => {
    if (savedView) {
      setSearchQuery(savedView.searchQuery);
      setSelectedPriorityFilter(savedView.selectedPriorityFilter);
      setSelectedStatusFilter(savedView.selectedStatusFilter);
      setSortBy(savedView.sortBy as any);
      setShowClosedTasks(savedView.showClosedTasks);
    } else {
      setShowClosedTasks(false);
    }
  }, [savedView]);

  // Autosave: persist whenever filters change (only when autosave is on)
  useEffect(() => {
    if (!autosaveEnabled || !tableViewKey) return;
    const v = currentTableView();
    try { localStorage.setItem(tableViewKey, JSON.stringify(v)); } catch {}
    setSavedView(v);
  }, [autosaveEnabled, tableViewKey, searchQuery, selectedPriorityFilter, selectedStatusFilter, sortBy, showClosedTasks, currentTableView]);

  // ── Project meta ──
  const [projectColor, setProjectColor] = useState("#3b82f6");
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<ProjectStatusType>("On track");
  const [description, setDescription] = useState("What's this project about?");

  // Persist color, icon, and favorite to localStorage whenever they change
  useEffect(() => {
    if (!resolvedProjectId) return;
    saveProjectMeta(resolvedProjectId, { color: projectColor, iconIndex: selectedIconIndex, isFavorite });
  }, [resolvedProjectId, projectColor, selectedIconIndex, isFavorite]);

  // ── Inline task add (list view) ──
  const [inlineAddingSectionId, setInlineAddingSectionId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const inlineInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inlineAddingSectionId && inlineInputRef.current) inlineInputRef.current.focus();
  }, [inlineAddingSectionId]);

  // ── Modal state ──
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [defaultTaskListId, setDefaultTaskListId] = useState<string | undefined>(undefined);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // ── Handlers ──
  const triggerAddTask = (sectionId?: string) => {
    setDefaultTaskListId(sectionId ?? lists[0]?.id ?? undefined);
    setIsCreateTaskOpen(true);
    if (activeTab === "Overview") setActiveTab("List");
  };

  async function handleSaveInlineTask(listId: string) {
    if (!newTaskTitle.trim()) {
      setInlineAddingSectionId(null);
      return;
    }
    await createTask(listId, { title: newTaskTitle.trim(), listId });
    setNewTaskTitle("");
    setInlineAddingSectionId(null);
  }

  async function handleUpdateTask(updatedTask: TaskItem) {
    setSelectedTask(updatedTask);
    const VALID_STATUSES = ["On track", "At risk", "Off track", "On hold", "Complete", "Dropped"] as const;
    type ValidStatus = typeof VALID_STATUSES[number];
    const safeStatus = VALID_STATUSES.includes(updatedTask.status as ValidStatus)
      ? (updatedTask.status as ValidStatus)
      : undefined;
    await updateTask(updatedTask.id, {
      title: updatedTask.title,
      description: updatedTask.description ?? null,
      priority: updatedTask.priority,
      status: safeStatus,
    });
  }

  async function handleDeleteTask(taskId: string) {
    await deleteTask(taskId);
  }

  /* Convert a board-store TaskRecord into the TaskItem shape the detail pane expects */
  function taskRecordToItem(task: TaskRecord): TaskItem {
    function getInitials(name: string) {
      return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    }
    const listName = lists.find((l) => l.id === task.listId)?.name ?? task.listId;
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      assignee: task.assignee
        ? { name: task.assignee.name, initials: getInitials(task.assignee.name) }
        : undefined,
      dueDate: task.dueDate
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(task.dueDate))
        : undefined,
      priority: (task.priority as TaskItem["priority"]) ?? undefined,
      status: (task.status as TaskItem["status"]) ?? undefined,
      subtasks: [],
      sectionId: listName,
    };
  }

  function handleSelectBoardTask(task: TaskRecord) {
    setSelectedTask(taskRecordToItem(task));
  }

  function handleAddTab(tabName: string) {
    if (!availableTabs.includes(tabName)) setAvailableTabs((prev) => [...prev, tabName]);
    setActiveTab(tabName);
  }

  async function handleAddSection() {
    const newSecTitle = prompt("Enter section name:");
    if (newSecTitle) await createList(newSecTitle);
  }

  const filteredSections = useMemo(() => {
    const PRIORITY_RANK: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
    return sections.map((sec) => {
      let filtered = sec.tasks.filter((task) => {
        const matchesSearch = !searchQuery.trim() || task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = selectedPriorityFilter === "All" || task.priority === selectedPriorityFilter;
        const matchesStatus = selectedStatusFilter === "All" || task.status === selectedStatusFilter;
        return matchesSearch && matchesPriority && matchesStatus;
      });
      // Apply sort
      switch (sortBy) {
        case "name":
          filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "priority":
          filtered = [...filtered].sort(
            (a, b) => (PRIORITY_RANK[a.priority ?? "Low"] || 9) - (PRIORITY_RANK[b.priority ?? "Low"] || 9)
          );
          break;
        case "assignee":
          filtered = [...filtered].sort((a, b) =>
            (a.assignee?.name ?? "").localeCompare(b.assignee?.name ?? "")
          );
          break;
        case "dueDate":
          filtered = [...filtered].sort((a, b) => {
            const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return da - db;
          });
          break;
        // For fields without data (startDate, dateCreated, etc.) keep default order
        default:
          break;
      }
      return { ...sec, tasks: filtered };
    });
  }, [sections, searchQuery, selectedPriorityFilter, selectedStatusFilter, sortBy]);

  if (resolveError) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        {resolveError}
      </div>
    );
  }

  if (isResolvingProject || !resolvedProjectId) {
    return <ProjectDetailSkeleton />;
  }

  return (
    <div className="flex h-full bg-white dark:bg-[#0f1d31] text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ProjectHeader
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          projectColor={projectColor}
          setProjectColor={setProjectColor}
          selectedIconIndex={selectedIconIndex}
          setSelectedIconIndex={setSelectedIconIndex}
          isFavorite={isFavorite}
          setIsFavorite={setIsFavorite}
          status={status}
          setStatus={setStatus}
          members={members}
          onAddMember={() => setIsAddMemberOpen(true)}
        />

        <ProjectTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          availableTabs={availableTabs}
          onAddTab={handleAddTab}
        />

        <div className="flex-1 overflow-auto flex flex-col">
          {activeTab === "Overview" ? (
            isLoading ? <OverviewTabSkeleton noShell={true} /> :
            <OverviewTab
              status={status}
              setStatus={setStatus}
              description={description}
              setDescription={setDescription}
              ownerName="Ellen Grace Sinday"
              ownerInitials="ES"
              projectId={resolvedProjectId}
              members={members}
              currentUserRole="Project Manager"
              onAddMember={() => setIsAddMemberOpen(true)}
              onMembersChanged={fetchMembers}
            />
          ) : activeTab === "Board" ? (
            <div className="flex flex-col h-full">
              <ProjectToolbar
                onAddTask={triggerAddTask}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedPriorityFilter={selectedPriorityFilter}
                setSelectedPriorityFilter={setSelectedPriorityFilter}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onAddSection={handleAddSection}
                hideClosed={true}
              />
              <div className="flex-1 overflow-auto">
                <KanbanBoard projectId={resolvedProjectId} onSelectTask={handleSelectBoardTask} />
              </div>
            </div>
          ) : activeTab === "Timeline" || activeTab === "Gantt" ? (
            isLoading ? <TimelineTabSkeleton noShell={true} /> :
            <TimelineTab
              sections={filteredSections}
              onSelectTask={setSelectedTask}
              onAddTask={triggerAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : activeTab === "Dashboard" ? (
            isLoading ? <DashboardTabSkeleton noShell={true} /> :
            <DashboardTab sections={filteredSections} />
          ) : activeTab === "Calendar" ? (
            isLoading ? <CalendarTabSkeleton noShell={true} /> :
            <CalendarTab sections={filteredSections} onSelectTask={setSelectedTask} onAddTask={triggerAddTask} />
          ) : activeTab === "Table" ? (
            isLoading ? <ListTabSkeleton noShell={true} /> :
            <div className="flex flex-col h-full">
              <ProjectToolbar
                onAddTask={triggerAddTask}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedPriorityFilter={selectedPriorityFilter}
                setSelectedPriorityFilter={setSelectedPriorityFilter}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onAddSection={handleAddSection}
                tableMode={true}
                showClosedTasks={showClosedTasks}
                onToggleClosedTasks={() => setShowClosedTasks((v) => !v)}
                onRevertClosedTasks={handleRevertClosedTasks}
                onSaveView={handleSaveView}
                onEnableAutosave={handleEnableAutosave}
                autosaveEnabled={autosaveEnabled}
                onSaveAsNewView={handleSaveAsNewView}
              />
              <div className="flex-1 overflow-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50">
                      <th className="text-left px-6 py-2.5 text-[11px] font-semibold text-slate-400 w-full">Name</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 whitespace-nowrap min-w-[140px]">Assignee</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 whitespace-nowrap min-w-[110px]">Status</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 whitespace-nowrap min-w-[110px]">Due date</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 whitespace-nowrap min-w-[100px]">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredSections.flatMap((sec) => {
                      const CLOSED_STATUSES = ["Complete", "Completed"];
                      const visibleTasks = showClosedTasks
                        ? sec.tasks
                        : sec.tasks.filter((t) => !CLOSED_STATUSES.includes(t.status ?? ""));
                      if (visibleTasks.length === 0) return [];
                      return [
                        <tr key={`sec-${sec.id}`}>
                          <td colSpan={5} className="px-6 py-2 bg-slate-50/30 dark:bg-[#0f1d31]/30">
                            <div className="flex items-center gap-2">
                              <ChevronDown size={13} className="text-slate-400" />
                              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{sec.title}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{visibleTasks.length}</span>
                            </div>
                          </td>
                        </tr>,
                        ...visibleTasks.map((task) => (
                          <tr
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`hover:bg-sky-50/40 dark:hover:bg-sky-950/20 cursor-pointer transition-colors ${selectedTask?.id === task.id ? "bg-sky-50 dark:bg-sky-950/30" : ""}`}
                          >
                            <td className="px-6 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 size={15} className="text-slate-300 dark:text-slate-600 hover:text-emerald-500 shrink-0" />
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[320px]">{task.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              {task.assignee ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0">{task.assignee.initials}</span>
                                  <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate">{task.assignee.name}</span>
                                </div>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">+</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {task.status && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                  task.status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                                  task.status === "On track" ? "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400" :
                                  task.status === "At risk" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                                  task.status === "Off track" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" :
                                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}>{task.status}</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {task.dueDate && <span className="text-rose-500 font-medium text-[11px]">{task.dueDate}</span>}
                            </td>
                            <td className="px-4 py-2.5">
                              {task.priority && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                  task.priority === "High" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" :
                                  task.priority === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}>{task.priority}</span>
                              )}
                            </td>
                          </tr>
                        )),
                      ];
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "Form" ? (
            <div className="flex-1 overflow-auto bg-white dark:bg-[#0f1d31]">
              <div className="max-w-4xl mx-auto px-8 py-10">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Bug Ticket Form</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">This form is intended for bug tickets only</p>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">BUG ID <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Enter text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0033a0] transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Test Case Title <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Enter text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0033a0] transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Test Case Description <span className="text-red-500">*</span></label>
                    <textarea rows={4} placeholder="Enter text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0033a0] resize-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Steps to Reproduce and Expected Results <span className="text-red-500">*</span></label>
                    <textarea rows={4} placeholder="Enter text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0033a0] resize-none transition" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Severity <span className="text-red-500">*</span></label>
                      <select defaultValue="" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] outline-none focus:ring-2 focus:ring-[#0033a0] transition">
                        <option value="" disabled>Select option...</option>
                        <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Priority <span className="text-red-500">*</span></label>
                      <select defaultValue="" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] outline-none focus:ring-2 focus:ring-[#0033a0] transition">
                        <option value="" disabled>Select option...</option>
                        <option>High</option><option>Medium</option><option>Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Story Points Estimated <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Enter text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0033a0] transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Label <span className="text-red-500">*</span></label>
                      <select defaultValue="" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] outline-none focus:ring-2 focus:ring-[#0033a0] transition">
                        <option value="" disabled>Select option...</option>
                        <option>Bug</option><option>Feature</option><option>Enhancement</option><option>Documentation</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                      <input type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] outline-none focus:ring-2 focus:ring-[#0033a0] [color-scheme:light] dark:[color-scheme:dark] transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Due Date <span className="text-red-500">*</span></label>
                      <input type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#14263e] outline-none focus:ring-2 focus:ring-[#0033a0] [color-scheme:light] dark:[color-scheme:dark] transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Evidence/Screenshot</label>
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-[#0033a0] transition-colors">
                        <span className="text-sm text-slate-400">Drop your files here to <span className="text-[#0033a0] dark:text-blue-400 underline font-semibold">upload</span></span>
                        <input type="file" className="hidden" multiple />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Assignee <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-2">
                        <button type="button" className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-[#0033a0] hover:text-[#0033a0] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                        </button>
                        <span className="text-xs text-slate-400">Click to assign</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors">Submit</button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            isLoading ? <ListTabSkeleton noShell={true} /> :
            <div className="flex flex-col h-full">
              <ProjectToolbar
                onAddTask={triggerAddTask}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedPriorityFilter={selectedPriorityFilter}
                setSelectedPriorityFilter={setSelectedPriorityFilter}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onAddSection={handleAddSection}
                hideClosed={true}
              />

              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-[1fr_180px_140px_120px_120px_40px] border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 px-6 py-1.5 bg-slate-50/30 dark:bg-[#0f1d31]/30">
                  <div>Name</div>
                  <div>Assignee</div>
                  <div>Due date</div>
                  <div>Priority</div>
                  <div>Status</div>
                  <div className="text-center">+</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSections.map((section) => (
                    <div key={section.id} className="py-2">
                      <div className="flex items-center gap-2 px-6 py-2">
                        <ChevronDown size={14} className="text-slate-400" />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{section.title}</span>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {section.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`grid grid-cols-[1fr_180px_140px_120px_120px_40px] items-center px-6 py-1.5 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 cursor-pointer text-xs transition-colors ${
                              selectedTask?.id === task.id ? "bg-sky-50 dark:bg-sky-950/30" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5 pr-2">
                              <CheckCircle2 size={16} className="text-slate-300 dark:text-slate-600 hover:text-emerald-500 shrink-0" />
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</span>
                            </div>
                            <div>
                              {task.assignee ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {task.assignee.initials}
                                  </span>
                                  <span className="text-slate-600 dark:text-slate-400 truncate text-[11px]">{task.assignee.name}</span>
                                </div>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">+</span>
                              )}
                            </div>
                            <div>
                              {task.dueDate && <span className="text-rose-500 font-medium text-[11px]">{task.dueDate}</span>}
                            </div>
                            <div>
                              {task.priority && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                                  {task.priority}
                                </span>
                              )}
                            </div>
                            <div>
                              {task.status && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                                  {task.status}
                                </span>
                              )}
                            </div>
                            <div />
                          </div>
                        ))}

                        {inlineAddingSectionId === section.id ? (
                          <div className="grid grid-cols-[1fr_180px_140px_120px_120px_40px] items-center px-6 py-1.5 bg-sky-50/30 border-l-2 border-sky-500">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 size={16} className="text-slate-300" />
                              <input
                                ref={inlineInputRef}
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveInlineTask(section.id);
                                  if (e.key === "Escape") setInlineAddingSectionId(null);
                                }}
                                onBlur={() => handleSaveInlineTask(section.id)}
                                placeholder="Write a task name"
                                className="w-full text-xs bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 p-0"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="px-6 py-2">
                            <button
                              onClick={() => setInlineAddingSectionId(section.id)}
                              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                            >
                              Add task...
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Details Pane */}
      {selectedTask && (
        <TaskDetailsPane
          task={selectedTask}
          projectName={projectTitle}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        lists={lists.map((l) => ({ id: l.id, name: l.name }))}
        defaultListId={defaultTaskListId}
        onSuccess={() => setIsCreateTaskOpen(false)}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        projectId={resolvedProjectId}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={(member) => {
          setMembers((prev) => [...prev, { ...member, projectId: resolvedProjectId, createdAt: new Date() }]);
        }}
      />
    </div>
  );
}