"use client";

import React, { use, useState, useRef, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Plus,
} from "lucide-react";
import { TaskDetailsPane, TaskItem } from "@/components/tasks/task-details";
import { ProjectHeader } from "@/components/projects/details/project-header";
import { ProjectTabs } from "@/components/projects/details/project-tabs";
import { ProjectToolbar } from "@/components/projects/details/project-toolbar";
import { OverviewTab } from "@/components/projects/details/overview-tab";
import { BoardTab } from "@/components/projects/details/board-tab";
import { TimelineTab } from "@/components/projects/details/timeline-tab";
import { DashboardTab } from "@/components/projects/details/dashboard-tab";
import { CalendarTab } from "@/components/projects/details/calendar-tab";
import { Section, ProjectStatusType } from "@/components/projects/details/types";
import { useProjectTitle } from "@/context/project-title-context";

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const initialSections: Section[] = [
  {
    id: "to-do",
    title: "To do",
    tasks: [
      {
        id: "t1",
        title: "Task 1",
        sectionId: "To do",
        assignee: { name: "Ellen Grace Sinday", initials: "ES" },
        dueDate: "Jul 20 – 22",
        priority: "Low",
        status: "On track",
      },
      {
        id: "t2",
        title: "Task 2",
        sectionId: "To do",
        assignee: { name: "Ellen Grace Sinday", initials: "ES" },
        dueDate: "Jul 21 – 23",
        priority: "Medium",
        status: "At risk",
      },
      {
        id: "t3",
        title: "Task 3",
        sectionId: "To do",
        dueDate: "Jul 22 – 24",
        priority: "High",
        status: "Off track",
      },
    ],
  },
  {
    id: "doing",
    title: "Doing",
    tasks: [],
  },
  {
    id: "done",
    title: "Done",
    tasks: [],
  },
];

export default function AsanaProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = use(params);
  const initialTitle = slugToTitle(slug);

  // State
  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [sections, setSections] = useState<Section[]>(initialSections);

  // Sync project title into context so the layout Header updates live
  const { setProjectTitle: setContextTitle } = useProjectTitle();
  useEffect(() => {
    setContextTitle(projectTitle);
    return () => setContextTitle(null); // clear on unmount
  }, [projectTitle, setContextTitle]);

  const [availableTabs, setAvailableTabs] = useState<string[]>([
    "Overview",
    "List",
    "Board",
    "Timeline",
    "Dashboard",
    "Calendar",
  ]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "name" | "priority">("default");

  // Project Header Customization & Status State
  const [projectColor, setProjectColor] = useState("#3b82f6");
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [status, setStatus] = useState<ProjectStatusType>("On track");
  const [description, setDescription] = useState("What's this project about?");

  // Inline Add Task State
  const [inlineAddingSectionId, setInlineAddingSectionId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const inlineInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inlineAddingSectionId && inlineInputRef.current) {
      inlineInputRef.current.focus();
    }
  }, [inlineAddingSectionId]);

  const triggerAddTask = (sectionId: string = "to-do") => {
    setInlineAddingSectionId(sectionId);
    if (activeTab === "Overview") {
      setActiveTab("List");
    }
  };

  const handleSaveInlineTask = (sectionId: string) => {
    if (!newTaskTitle.trim()) {
      setInlineAddingSectionId(null);
      return;
    }

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskTitle,
      sectionId: sections.find((s) => s.id === sectionId)?.title || "To do",
      status: "On track",
      priority: "Medium",
    };

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId ? { ...sec, tasks: [...sec.tasks, newTask] } : sec
      )
    );

    setNewTaskTitle("");
    setInlineAddingSectionId(null);
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setSelectedTask(updatedTask);
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        tasks: sec.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      }))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        tasks: sec.tasks.filter((t) => t.id !== taskId),
      }))
    );
  };

  const handleAddTab = (tabName: string) => {
    if (!availableTabs.includes(tabName)) {
      setAvailableTabs((prev) => [...prev, tabName]);
    }
    setActiveTab(tabName);
  };

  const handleAddSection = () => {
    const newSecTitle = prompt("Enter section name:");
    if (newSecTitle) {
      setSections((prev) => [
        ...prev,
        { id: newSecTitle.toLowerCase().replace(/\s+/g, "-"), title: newSecTitle, tasks: [] },
      ]);
    }
  };

  // Filtered & Sorted Sections
  const filteredSections = useMemo(() => {
    return sections.map((sec) => {
      let filtered = sec.tasks.filter((task) => {
        const matchesSearch =
          !searchQuery.trim() ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority =
          selectedPriorityFilter === "All" || task.priority === selectedPriorityFilter;
        const matchesStatus =
          selectedStatusFilter === "All" || task.status === selectedStatusFilter;

        return matchesSearch && matchesPriority && matchesStatus;
      });

      if (sortBy === "name") {
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === "priority") {
        const pRank = { High: 1, Medium: 2, Low: 3 };
        filtered = [...filtered].sort(
          (a, b) => (pRank[a.priority || "Low"] || 9) - (pRank[b.priority || "Low"] || 9)
        );
      }

      return { ...sec, tasks: filtered };
    });
  }, [sections, searchQuery, selectedPriorityFilter, selectedStatusFilter, sortBy]);

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f1d31] text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header (Title, Customization, Set Status, Share, Favorites) */}
        <ProjectHeader
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          projectColor={projectColor}
          setProjectColor={setProjectColor}
          selectedIconIndex={selectedIconIndex}
          setSelectedIconIndex={setSelectedIconIndex}
          status={status}
          setStatus={setStatus}
        />

        {/* Tabs Navigation Bar */}
        <ProjectTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          availableTabs={availableTabs}
          onAddTab={handleAddTab}
        />

        {/* Main Content View per Tab */}
        <div className="flex-1 overflow-auto flex flex-col">
          {activeTab === "Overview" ? (
            <OverviewTab
              status={status}
              setStatus={setStatus}
              description={description}
              setDescription={setDescription}
              ownerName="Ellen Grace Sinday"
              ownerInitials="ES"
            />
          ) : activeTab === "Board" ? (
            <BoardTab
              sections={filteredSections}
              onSelectTask={setSelectedTask}
              onAddTask={triggerAddTask}
              onAddSection={handleAddSection}
            />
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
            /* List View */
            <div className="flex flex-col h-full">
              {/* Toolbar (Search, Filter, Sort, Add Task) */}
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

              {/* List Table Content */}
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
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {section.title}
                        </span>
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
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                {task.title}
                              </span>
                            </div>

                            <div>
                              {task.assignee ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {task.assignee.initials}
                                  </span>
                                  <span className="text-slate-600 dark:text-slate-400 truncate text-[11px]">
                                    {task.assignee.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">
                                  +
                                </span>
                              )}
                            </div>

                            <div>
                              {task.dueDate && (
                                <span className="text-rose-500 font-medium text-[11px]">
                                  {task.dueDate}
                                </span>
                              )}
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
                              onClick={() => triggerAddTask(section.id)}
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

      {/* Slide-over Task Details Modal Pane */}
      {selectedTask && (
        <TaskDetailsPane
          task={selectedTask}
          projectName={projectTitle}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}