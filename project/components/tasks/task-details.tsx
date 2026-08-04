"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  X,
  Share2,
  ThumbsUp,
  Link2,
  Maximize2,
  MoreHorizontal,
  ChevronRight,
  User,
  Calendar,
  Layers,
  Plus,
  Send,
} from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  assignee?: { name: string; initials: string; avatarColor?: string };
  dueDate?: string;
  priority?: "Low" | "Medium" | "High";
  status?: "On track" | "At risk" | "Off track";
  description?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  sectionId: string;
}

interface TaskDetailsPaneProps {
  task: TaskItem;
  projectName: string;
  onClose: () => void;
  onUpdateTask: (task: TaskItem) => void;
}

export function TaskDetailsPane({
  task,
  projectName,
  onClose,
  onUpdateTask,
}: TaskDetailsPaneProps) {
  const [completed, setCompleted] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const updated = [
      ...subtasks,
      { id: Date.now().toString(), title: newSubtaskTitle, completed: false },
    ];
    setSubtasks(updated);
    setNewSubtaskTitle("");
    onUpdateTask({ ...task, subtasks: updated });
  };

  const toggleSubtask = (id: string) => {
    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updated);
    onUpdateTask({ ...task, subtasks: updated });
  };

  return (
    <div className="w-[600px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31] flex flex-col h-full shadow-2xl z-20 transition-all duration-200">
      {/* Pane Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31]">
        <button
          onClick={() => setCompleted(!completed)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            completed
              ? "bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800"
              : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          }`}
        >
          <CheckCircle2 size={16} className={completed ? "fill-emerald-600 text-white" : ""} />
          {completed ? "Completed" : "Mark complete"}
        </button>

        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
            <ThumbsUp size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
            <Link2 size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
            <Maximize2 size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
            <MoreHorizontal size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md ml-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Pane Banner Note */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#14263e] border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          🔒 This task is private to members of this project.
        </span>
        <button className="text-slate-600 dark:text-slate-300 hover:underline text-[11px] font-medium">
          Make public
        </button>
      </div>

      {/* Pane Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            onUpdateTask({ ...task, title: e.target.value });
          }}
          className="w-full text-2xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-white focus:ring-0 px-0"
          placeholder="Task title"
        />

        {/* Property Grid */}
        <div className="grid grid-cols-[120px_1fr] gap-y-4 text-sm items-center">
          <div className="text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <User size={15} /> Assignee
          </div>
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center font-bold text-[10px]">
                  {task.assignee.initials}
                </span>
                {task.assignee.name}
              </div>
            ) : (
              <span className="text-slate-400 text-xs flex items-center gap-1 cursor-pointer hover:text-slate-600">
                <User size={14} /> No assignee
              </span>
            )}
          </div>

          <div className="text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Calendar size={15} /> Due date
          </div>
          <div>
            {task.dueDate ? (
              <span className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded">
                {task.dueDate}
              </span>
            ) : (
              <span className="text-slate-400 text-xs">No due date</span>
            )}
          </div>

          <div className="text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Layers size={15} /> Projects
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {projectName}
            </span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-500">{task.sectionId}</span>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Priority & Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Priority</span>
            {task.priority && (
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  task.priority === "Low"
                    ? "bg-emerald-100 text-emerald-700"
                    : task.priority === "Medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {task.priority}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Status</span>
            {task.status && (
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  task.status === "On track"
                    ? "bg-sky-100 text-sky-700"
                    : task.status === "At risk"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {task.status}
              </span>
            )}
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Description Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description
          </h4>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              onUpdateTask({ ...task, description: e.target.value });
            }}
            placeholder="What is this task about?"
            rows={3}
            className="w-full text-xs text-slate-600 dark:text-slate-300 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-300 dark:hover:border-slate-700 rounded-lg p-2 outline-none resize-none transition-colors"
          />
        </div>

        {/* Subtasks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Subtasks
            </h4>
          </div>

          <div className="space-y-1.5">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center gap-2 group text-xs text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => toggleSubtask(st.id)}
                  className="rounded text-sky-500 focus:ring-0"
                />
                <span className={st.completed ? "line-through text-slate-400" : ""}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="pt-2">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
              <Plus size={14} className="text-slate-400" />
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Type to add a subtask..."
                className="w-full text-xs bg-transparent border-none outline-none text-slate-700 dark:text-slate-300"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Pane Footer / Comments Area */}
      <div className="p-4 bg-slate-50 dark:bg-[#14263e] border-t border-slate-200 dark:border-slate-800 flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-900 font-bold text-xs flex items-center justify-center flex-shrink-0">
          ES
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full text-xs bg-white dark:bg-[#0f1d31] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 outline-none text-slate-700 dark:text-slate-200"
          />
          <button className="absolute right-2.5 top-2 text-slate-400 hover:text-sky-500">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}