"use client";

import React, { use, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { TaskDetailsPane, TaskItem } from "@/components/tasks/task-details";
import { ProjectHeader } from "@/components/projects/details/project-header";
import { ProjectTabs } from "@/components/projects/details/project-tabs";
import { ProjectToolbar } from "@/components/projects/details/project-toolbar";
import { OverviewTab } from "@/components/projects/details/overview-tab";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import type { TaskRecord } from "@/app/actions/task-actions";
import { TimelineTab } from "@/components/projects/details/timeline-tab";
import { DashboardTab } from "@/components/projects/details/dashboard-tab";
import { CalendarTab } from "@/components/projects/details/calendar-tab";
import { ProjectStatusType } from "@/components/projects/details/types";
import { useProjectTitle } from "@/context/project-title-context";
import { useBoardStore } from "@/stores/board-store";
import { buildSectionsFromBoard } from "@/lib/board-to-sections";
import { ProjectDetailSkeleton, OverviewTabSkeleton, ListTabSkeleton, TimelineTabSkeleton, DashboardTabSkeleton, CalendarTabSkeleton } from "@/components/projects/details/skeleton-loading";
import { getProjectBySlugAction } from "@/app/actions/project-actions";
import { getProjectMembersAction, type ProjectMember } from "@/app/actions/member-actions";
import { AddMemberModal } from "@/components/modals/add-member-modal";
import { CreateTaskModal } from "@/components/modals/create-task-modal";

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
    "Overview", "List", "Board", "Timeline", "Dashboard", "Calendar",
  ]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "name" | "priority">("default");

  // ── Project meta ──
  const [projectColor, setProjectColor] = useState("#3b82f6");
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [status, setStatus] = useState<ProjectStatusType>("On track");
  const [description, setDescription] = useState("What's this project about?");

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
    await updateTask(updatedTask.id, {
      title: updatedTask.title,
      description: updatedTask.description ?? null,
      priority: updatedTask.priority,
      status: updatedTask.status,
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
    return sections.map((sec) => {
      let filtered = sec.tasks.filter((task) => {
        const matchesSearch = !searchQuery.trim() || task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = selectedPriorityFilter === "All" || task.priority === selectedPriorityFilter;
        const matchesStatus = selectedStatusFilter === "All" || task.status === selectedStatusFilter;
        return matchesSearch && matchesPriority && matchesStatus;
      });
      if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      if (sortBy === "priority") {
        const pRank: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
        filtered = [...filtered].sort((a, b) => (pRank[a.priority ?? "Low"] || 9) - (pRank[b.priority ?? "Low"] || 9));
      }
      return { ...sec, tasks: filtered };
    });
  }, [sections, searchQuery, selectedPriorityFilter, selectedStatusFilter, sortBy]);

  if (resolveError) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-red-500">
        {resolveError}
      </div>
    );
  }

  if (isResolvingProject || !resolvedProjectId) {
    return <ProjectDetailSkeleton />;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f1d31] text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ProjectHeader
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          projectColor={projectColor}
          setProjectColor={setProjectColor}
          selectedIconIndex={selectedIconIndex}
          setSelectedIconIndex={setSelectedIconIndex}
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
            isLoading ? <OverviewTabSkeleton /> :
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
            <KanbanBoard projectId={resolvedProjectId} onSelectTask={handleSelectBoardTask} />
          ) : activeTab === "Timeline" || activeTab === "Gantt" ? (
            isLoading ? <TimelineTabSkeleton /> :
            <TimelineTab
              sections={filteredSections}
              onSelectTask={setSelectedTask}
              onAddTask={triggerAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : activeTab === "Dashboard" ? (
            isLoading ? <DashboardTabSkeleton /> :
            <DashboardTab sections={filteredSections} />
          ) : activeTab === "Calendar" ? (
            isLoading ? <CalendarTabSkeleton /> :
            <CalendarTab sections={filteredSections} onSelectTask={setSelectedTask} onAddTask={triggerAddTask} />
          ) : (
            isLoading ? <ListTabSkeleton /> :
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