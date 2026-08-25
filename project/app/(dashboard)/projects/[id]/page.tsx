"use client";

import { type ProjectMember, getProjectMembersAction } from "@/actions/member-actions";
import { getProjectBySlugAction, updateProjectAction } from "@/actions/project-actions";
import type { TaskRecord } from "@/actions/task-actions";
import { AddMemberModal } from "@/components/modals/add-member-modal";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { CalendarTab } from "@/components/projects/details/calendar-tab";
import { DashboardTab } from "@/components/projects/details/dashboard-tab";
import { ListTab } from "@/components/projects/details/list-tab";
import { OverviewTab } from "@/components/projects/details/overview-tab";
import { ProjectHeader } from "@/components/projects/details/project-header";
import { ProjectTabs } from "@/components/projects/details/project-tabs";
import { ProjectToolbar } from "@/components/projects/details/project-toolbar";
import { TimelineTab } from "@/components/projects/details/timeline-tab";
import type { ProjectStatusType } from "@/components/projects/details/types";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskDetailsPane, type TaskItem } from "@/components/tasks/task-details";
import { useProjectTitle } from "@/context/project-title-context";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { buildSectionsFromBoard } from "@/lib/board-to-sections";
import { loadProjectMeta, saveProjectMeta } from "@/lib/project-meta";
import { useBoardStore } from "@/stores/board-store";
import { FolderX } from "lucide-react";
import Link from "next/link";
import React, { use, useState, useEffect, useMemo, useCallback } from "react";

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

  const [projectDescription, setProjectDescription] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [projectColor, setProjectColor] = useState("#3b82f6");
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<ProjectStatusType>("On track");
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const { lists, tasks, loadProject, createTask, updateTask, deleteTask, createList } =
    useBoardStore();

  const fetchMembers = useCallback(async (pId: string) => {
    if (!pId) return;
    const m = await getProjectMembersAction(pId);
    setMembers(m);
  }, []);

  // Parallel, high-speed initial resolution
  useEffect(() => {
    let isMounted = true;
    setIsResolvingProject(true);

    getProjectBySlugAction(slug).then((project) => {
      if (!isMounted) return;
      if (!project) {
        setResolveError("Project not found.");
        setIsResolvingProject(false);
        return;
      }

      setResolvedProjectId(project.id);
      setProjectTitle(project.name);
      setProjectDescription(project.description || "");
      setTempDescription(project.description || "");
      setOwnerName(project.ownerName || "");
      setCategories(project.categories || []);
      setTechStack(project.techStack || []);
      if (project.status) setStatus(project.status as ProjectStatusType);

      const saved = loadProjectMeta(project.id);
      if (saved) {
        setProjectColor(saved.color);
        setSelectedIconIndex(saved.iconIndex);
        setIsFavorite(saved.isFavorite);
        if (saved.views && saved.views.length > 0) {
          setAvailableTabs(saved.views);
          setActiveTab(saved.views[0]);
        }
      }

      setIsResolvingProject(false);

      // Immediately fetch board tasks/lists and members in parallel
      loadProject(project.id);
      fetchMembers(project.id);
    });

    return () => {
      isMounted = false;
    };
  }, [slug, loadProject, fetchMembers]);

  const sections = useMemo(() => buildSectionsFromBoard(lists, tasks), [lists, tasks]);

  const [availableTabs, setAvailableTabs] = useState([
    "Overview",
    "List",
    "Board",
    "Timeline",
    "Dashboard",
  ]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const {
    searchQuery,
    setSearchQuery,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    sortBy,
    setSortBy,
    filteredSections,
  } = useTaskFilters(resolvedProjectId, sections);

  useEffect(() => {
    if (!resolvedProjectId) return;
    saveProjectMeta(resolvedProjectId, {
      color: projectColor,
      iconIndex: selectedIconIndex,
      isFavorite,
    });
  }, [resolvedProjectId, projectColor, selectedIconIndex, isFavorite]);

  const [inlineAddingSectionId, setInlineAddingSectionId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [defaultTaskListId, setDefaultTaskListId] = useState<string | undefined>(undefined);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

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
    const VALID_STATUSES = [
      "On track",
      "At risk",
      "Off track",
      "On hold",
      "Complete",
      "Dropped",
    ] as const;
    type ValidStatus = (typeof VALID_STATUSES)[number];
    const safeStatus = VALID_STATUSES.includes(updatedTask.status as ValidStatus)
      ? (updatedTask.status as ValidStatus)
      : undefined;

    await updateTask(updatedTask.id, {
      title: updatedTask.title,
      description: updatedTask.description ?? null,
      priority: updatedTask.priority,
      status: safeStatus,
      assigneeId: updatedTask.assignee?.id || null,
      dueDate: updatedTask.dueDateISO || null,
    });

    const freshRecord = useBoardStore.getState().tasks.find((t) => t.id === updatedTask.id);
    setSelectedTask(freshRecord ? taskRecordToItem(freshRecord) : updatedTask);
  }

  async function handleDeleteTask(taskId: string) {
    await deleteTask(taskId);
  }

  function taskRecordToItem(task: TaskRecord): TaskItem {
    const getInitials = (name: string) =>
      name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    const listName = lists.find((l) => l.id === task.listId)?.name ?? task.listId;
    const dueDateISO = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : undefined;

    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      assignee: task.assignee
        ? {
            id: task.assigneeId ?? "",
            name: task.assignee.name,
            initials: getInitials(task.assignee.name),
          }
        : undefined,
      dueDate: task.dueDate
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
            new Date(task.dueDate),
          )
        : undefined,
      dueDateISO,
      priority: (task.priority as TaskItem["priority"]) ?? undefined,
      status: (task.status as TaskItem["status"]) ?? undefined,
      subtasks: [],
      sectionId: listName,
    };
  }

  const handleSaveDescription = async (newDesc: string) => {
    setProjectDescription(newDesc);
    if (!resolvedProjectId) return;
    const schemaStatus =
      status === "Complete" || status === "Dropped"
        ? "Completed"
        : status === "On hold"
          ? "On Hold"
          : "In Progress";
    await updateProjectAction({
      id: resolvedProjectId,
      name: projectTitle,
      description: newDesc,
      status: schemaStatus as "Not Started" | "In Progress" | "Completed" | "On Hold",
      priority: "Medium",
      categories,
      techStack,
      members: members.map((m) => ({ name: m.name, role: m.role })),
    });
  };

  const handleSaveTitle = async (newTitle: string) => {
    if (!resolvedProjectId) return;
    const schemaStatus =
      status === "Complete" || status === "Dropped"
        ? "Completed"
        : status === "On hold"
          ? "On Hold"
          : "In Progress";
    await updateProjectAction({
      id: resolvedProjectId,
      name: newTitle,
      description: projectDescription,
      status: schemaStatus as "Not Started" | "In Progress" | "Completed" | "On Hold",
      priority: "Medium",
      categories,
      techStack,
      members: members.map((m) => ({ name: m.name, role: m.role })),
    });
  };

  const handleSaveStatus = async (newStatus: ProjectStatusType) => {
    if (!resolvedProjectId) return;
    const schemaStatus =
      newStatus === "Complete" || newStatus === "Dropped"
        ? "Completed"
        : newStatus === "On hold"
          ? "On Hold"
          : "In Progress";
    await updateProjectAction({
      id: resolvedProjectId,
      name: projectTitle,
      description: projectDescription,
      status: schemaStatus as "Not Started" | "In Progress" | "Completed" | "On Hold",
      priority: "Medium",
      categories,
      techStack,
      members: members.map((m) => ({ name: m.name, role: m.role })),
    });
  };

  if (resolveError) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-[#0f1d31] px-6">
        <div className="text-center max-w-md space-y-5">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-[#142035] dark:to-[#1a2a45] flex items-center justify-center shadow-inner">
            <FolderX size={36} className="text-[#0033a0] dark:text-blue-400 opacity-80" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Project Not Found or Inaccessible
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              This project may have been deleted, renamed, or you may no longer have access. If
              you believe this is a mistake, ask a project admin to re-invite you.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#0033a0] hover:bg-[#002a80] rounded-xl shadow-sm transition-colors"
            >
              ← Back to Projects
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-[#0f1d31] text-slate-800 dark:text-slate-100 overflow-hidden font-sans relative">
      {/* Top subtle progress bar during background loading */}
      {isResolvingProject && (
        <div className="absolute top-0 left-0 right-0 z-50 h-0.5 bg-blue-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 animate-pulse w-full" />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ProjectHeader
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          onTitleSave={handleSaveTitle}
          projectColor={projectColor}
          setProjectColor={setProjectColor}
          selectedIconIndex={selectedIconIndex}
          setSelectedIconIndex={setSelectedIconIndex}
          isFavorite={isFavorite}
          setIsFavorite={setIsFavorite}
          status={status}
          setStatus={setStatus}
          onStatusSave={handleSaveStatus}
          members={members}
          onAddMember={() => setIsAddMemberOpen(true)}
        />

        <ProjectTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          availableTabs={availableTabs}
          onAddTab={(tabName) => {
            if (!availableTabs.includes(tabName)) {
              const updated = [...availableTabs, tabName];
              setAvailableTabs(updated);
              if (resolvedProjectId) {
                saveProjectMeta(resolvedProjectId, { views: updated });
              }
            }
            setActiveTab(tabName);
          }}
        />

        <div className="flex-1 overflow-auto flex flex-col">
          {activeTab === "Overview" ? (
            <OverviewTab
              projectDescription={projectDescription}
              tempDescription={tempDescription}
              setTempDescription={setTempDescription}
              isEditingDescription={isEditingDescription}
              setIsEditingDescription={setIsEditingDescription}
              isSavingDescription={isSavingDescription}
              onSaveDescription={async (d) => {
                setIsSavingDescription(true);
                await handleSaveDescription(d);
                setIsSavingDescription(false);
              }}
              ownerName={ownerName}
              status={status as string}
              taskCount={tasks.length}
              categories={categories}
              techStack={techStack}
              members={members}
              onAddMember={() => setIsAddMemberOpen(true)}
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
                onAddSection={async () => {
                  const t = prompt("Enter section name:");
                  if (t) await createList(t);
                }}
                hideClosed={true}
              />
              <div className="flex-1 min-h-0 flex flex-col">
                <KanbanBoard
                  projectId={resolvedProjectId ?? ""}
                  onSelectTask={(t) => setSelectedTask(taskRecordToItem(t))}
                />
              </div>
            </div>
          ) : activeTab === "Timeline" || activeTab === "Gantt" ? (
            <TimelineTab
              sections={filteredSections}
              onSelectTask={setSelectedTask}
              onAddTask={triggerAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : activeTab === "Dashboard" ? (
            <DashboardTab sections={filteredSections} />
          ) : activeTab === "Calendar" ? (
            <CalendarTab
              sections={filteredSections}
              onSelectTask={setSelectedTask}
              onAddTask={triggerAddTask}
            />
          ) : (
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
                onAddSection={async () => {
                  const t = prompt("Enter section name:");
                  if (t) await createList(t);
                }}
                hideClosed={true}
              />
              <ListTab
                filteredSections={filteredSections}
                selectedTask={selectedTask}
                onSelectTask={setSelectedTask}
                inlineAddingSectionId={inlineAddingSectionId}
                setInlineAddingSectionId={setInlineAddingSectionId}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                onSaveInlineTask={handleSaveInlineTask}
              />
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsPane
          task={selectedTask}
          projectName={projectTitle}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          members={members}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        lists={lists.map((l) => ({ id: l.id, name: l.name }))}
        defaultListId={defaultTaskListId}
        projectName={projectTitle}
        members={members}
        isLoading={isResolvingProject || lists.length === 0}
        onSuccess={() => setIsCreateTaskOpen(false)}
      />
      <AddMemberModal
        isOpen={isAddMemberOpen}
        projectOptions={resolvedProjectId ? [{ id: resolvedProjectId, name: projectTitle }] : []}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={() => {
          if (resolvedProjectId) fetchMembers(resolvedProjectId);
        }}
      />
    </div>
  );
}
