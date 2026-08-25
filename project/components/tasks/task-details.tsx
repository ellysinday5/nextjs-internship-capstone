"use client";

import type { ProjectMember } from "@/actions/member-actions";
import { type SharedTeamRecord } from "@/actions/task-actions";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { FilePreviewModal, type PreviewableFile } from "@/components/modals/file-preview-modal";
import { CommentThread } from "@/components/tasks/comments/comment-thread";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useUser } from "@clerk/nextjs";
import {
  Archive,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  CircleAlert,
  FileText,
  Film,
  Flag,
  ImageIcon,
  Layers,
  Link2,
  Loader2,
  Lock,
  Maximize2,
  Minimize2,
  Paperclip,
  Trash2,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface TaskItem {
  id: string;
  title: string;
  assignee?: { id: string; name: string; initials: string; avatarColor?: string };
  dueDate?: string; // formatted display string, e.g. "Aug 20" — for list/timeline views
  dueDateISO?: string; // "yyyy-MM-dd" — source of truth for the date input in this panel
  priority?: "Low" | "Medium" | "High";
  status?: "On track" | "At risk" | "Off track" | "On hold" | "Complete" | "Dropped";
  description?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  sectionId: string;
  isPublic?: boolean;
  sharedTeams?: SharedTeamRecord[];
}

interface TaskDetailsPaneProps {
  task: TaskItem;
  projectName: string;
  members: ProjectMember[];
  onClose: () => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
}

const PRIORITY_OPTIONS = ["Low", "Medium", "High"] as const;

// Must match task-schemas.ts STATUS_VALUES exactly — this was previously mismatched
// ("Completed" instead of "Complete", missing "On hold" / "Dropped"), which silently
// dropped the status whenever someone picked one of the broken options.
const STATUS_OPTIONS = [
  "On track",
  "At risk",
  "Off track",
  "On hold",
  "Complete",
  "Dropped",
] as const;

const STATUS_STYLE: Record<string, string> = {
  "On track": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "At risk": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "Off track": "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  "On hold": "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Complete: "bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white",
  Dropped: "bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
};

const PRIORITY_STYLE: Record<string, string> = {
  High: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/"))
    return <ImageIcon size={14} className="text-sky-500 shrink-0" />;
  if (type.startsWith("video/"))
    return <Film size={14} className="text-purple-500 shrink-0" />;
  if (type === "application/pdf")
    return <FileText size={14} className="text-rose-500 shrink-0" />;
  return <Archive size={14} className="text-slate-400 shrink-0" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatCommentTime(date: Date | string | null | undefined): string {
  if (!date) return "Just now";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TaskDetailsPane({
  task,
  projectName,
  members,
  onClose,
  onUpdateTask,
  onDeleteTask,
}: TaskDetailsPaneProps) {
  const { user: clerkUser } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [assignee, setAssignee] = useState<TaskItem["assignee"]>(task.assignee);
  const [dueDateISO, setDueDateISO] = useState<string | undefined>(task.dueDateISO);
  const [priority, setPriority] = useState<TaskItem["priority"]>(task.priority || "Medium");
  const [status, setStatus] = useState<TaskItem["status"]>(task.status || "On track");
  const [completed, setCompleted] = useState(task.status === "Complete");

  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  // Sync local state when selected task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setAssignee(task.assignee);
    setDueDateISO(task.dueDateISO);
    setPriority(task.priority || "Medium");
    setStatus(task.status || "On track");
    setCompleted(task.status === "Complete");
    setIsEditingAssignee(false);
    setIsEditingDueDate(false);
    setIsEditingPriority(false);
    setIsEditingStatus(false);
  }, [task]);

  // Track dirty state across all editable fields
  const isDirty =
    title !== task.title ||
    description !== (task.description || "") ||
    assignee?.id !== task.assignee?.id ||
    dueDateISO !== task.dueDateISO ||
    priority !== (task.priority || "Medium") ||
    status !== (task.status || "On track");

  function handleAttemptClose() {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  }

  function handleDiscardConfirm() {
    setShowDiscardModal(false);
    onClose();
  }

  // Click outside to close pane
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showDiscardModal || showDeleteModal) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore clicks inside task cards / list rows when switching tasks (handled by onSelect)
      if (target.closest(".cursor-pointer") || target.closest("[data-task-item]")) {
        return;
      }

      // Allow dragging or clicking scrollbars without closing the modal
      const isScrollbarClick =
        target.scrollHeight > target.clientHeight &&
        e.clientX >= target.getBoundingClientRect().right - 20;
      const isHorizontalScrollbarClick =
        target.scrollWidth > target.clientWidth &&
        e.clientY >= target.getBoundingClientRect().bottom - 20;

      if (isScrollbarClick || isHorizontalScrollbarClick) {
        return;
      }

      if (paneRef.current && !paneRef.current.contains(target)) {
        handleAttemptClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDirty, showDiscardModal, showDeleteModal]);

  function handleToggleComplete() {
    const nextCompleted = !completed;
    setCompleted(nextCompleted);
    setStatus(nextCompleted ? "Complete" : "On track");
  }

  function handleSave() {
    onUpdateTask({
      ...task,
      title,
      description,
      assignee,
      dueDateISO,
      priority,
      status,
    });
  }

  function handleDeleteConfirm() {
    setShowDeleteModal(false);
    onDeleteTask?.(task.id);
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newAttachment: AttachedFile = {
          id: `${Date.now()}-${f.name}`,
          name: f.name,
          size: f.size,
          type: f.type,
          url: dataUrl,
        };
        setAttachedFiles((prev) => {
          const updated = [...prev, newAttachment];
          try {
            localStorage.setItem(
              `syntraflow_attachments_${task.id}`,
              JSON.stringify(updated),
            );
          } catch (err) {
            console.warn("Could not save attachments to localStorage:", err);
          }
          return updated;
        });
      };
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  }

  function handleRemoveFile(id: string) {
    setAttachedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem(`syntraflow_attachments_${task.id}`, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save attachments to localStorage:", err);
      }
      return updated;
    });
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`syntraflow_attachments_${task.id}`);
      if (saved) {
        setAttachedFiles(JSON.parse(saved));
      } else {
        setAttachedFiles([]);
      }
    } catch {
      setAttachedFiles([]);
    }
  }, [task.id]);

  const paneClass = isExpanded
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    : "contents";

  const innerClass = isExpanded
    ? "relative w-full max-w-5xl h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d31] flex flex-col shadow-2xl overflow-hidden"
    : "w-[560px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31] flex flex-col h-full shadow-2xl z-20";

  const pane = (
    <div
      className={paneClass}
      onClick={
        isExpanded
          ? (e) => {
              if (e.target === e.currentTarget) handleAttemptClose();
            }
          : undefined
      }
    >
      <div ref={paneRef} className={innerClass}>
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={handleToggleComplete}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              completed
                ? "bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800"
                : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            }`}
          >
            <CheckCircle2 size={15} className={completed ? "fill-emerald-600 text-white" : ""} />
            {completed ? "Completed" : "Mark complete"}
          </button>
          <div className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              onClick={handleAttemptClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md ml-1"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-extrabold bg-transparent border-none outline-none text-slate-900 dark:text-white focus:ring-0 px-0"
            placeholder="Task title"
          />

          {/* Properties grid */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 text-sm overflow-hidden">
            {/* Assignee */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <User size={13} /> Assignee
              </span>
              <div>
                {isEditingAssignee ? (
                  <select
                    autoFocus
                    value={
                      (() => {
                        if (!assignee?.id) return "unassigned";
                        const match = members.find(
                          (m) => (m.userId && m.userId === assignee.id) || m.id === assignee.id,
                        );
                        return match ? (match.userId ?? match.id) : assignee.id;
                      })()
                    }
                    onChange={(e) => {
                      setIsEditingAssignee(false);
                      const val = e.target.value;
                      if (val === "unassigned") {
                        setAssignee(undefined);
                        return;
                      }
                      const found = members.find((m) => (m.userId ?? m.id) === val || m.id === val);
                      if (found) {
                        setAssignee({
                          id: found.userId ?? found.id,
                          name: found.name,
                          initials: getInitials(found.name),
                        });
                      }
                    }}
                    onBlur={() => setIsEditingAssignee(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100 cursor-pointer"
                  >
                    <option value="unassigned">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId ?? m.id} value={m.userId ?? m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setIsEditingAssignee(true)}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-[#00b4d8] transition-colors"
                  >
                    {assignee ? (
                      <>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-amber-950">
                          {assignee.initials}
                        </span>
                        {assignee.name}
                      </>
                    ) : (
                      <span className="text-slate-400">No assignee</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Due date */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Calendar size={13} /> Due date
              </span>
              <div>
                {isEditingDueDate ? (
                  <input
                    type="date"
                    autoFocus
                    value={dueDateISO || ""}
                    onChange={(e) => {
                      setIsEditingDueDate(false);
                      const iso = e.target.value;
                      setDueDateISO(iso || undefined);
                    }}
                    onBlur={() => setIsEditingDueDate(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100"
                  />
                ) : (
                  <button onClick={() => setIsEditingDueDate(true)} className="text-xs font-medium">
                    {dueDateISO ? (
                      <span className="text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md font-bold">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(dueDateISO))}
                      </span>
                    ) : (
                      <span className="text-slate-400">No due date</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Layers size={13} /> Projects
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">{projectName}</span>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="text-slate-500">{task.sectionId}</span>
              </div>
            </div>

            {/* Priority */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Flag size={13} /> Priority
              </span>
              <div>
                {isEditingPriority ? (
                  <select
                    autoFocus
                    value={priority || "Medium"}
                    onChange={(e) => {
                      setIsEditingPriority(false);
                      setPriority(e.target.value as TaskItem["priority"]);
                    }}
                    onBlur={() => setIsEditingPriority(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setIsEditingPriority(true)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${PRIORITY_STYLE[priority || "Medium"]}`}
                  >
                    {priority || "Medium"}
                  </button>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <CircleAlert size={13} /> Status
              </span>
              <div>
                {isEditingStatus ? (
                  <select
                    autoFocus
                    value={status || "On track"}
                    onChange={(e) => {
                      const s = e.target.value as TaskItem["status"];
                      setIsEditingStatus(false);
                      setCompleted(s === "Complete");
                      setStatus(s);
                    }}
                    onBlur={() => setIsEditingStatus(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${STATUS_STYLE[status || "On track"]}`}
                  >
                    {status || "On track"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Description
            </h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this task about?"
              rows={3}
              className="w-full text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#00b4d8] rounded-xl p-3 outline-none resize-none transition-colors"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip size={12} />
                Attachments{" "}
                {attachedFiles.length > 0 && (
                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">
                    {attachedFiles.length}
                  </span>
                )}
              </h4>
            </div>

            {attachedFiles.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-6 text-xs text-slate-400 hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors"
              >
                <Paperclip size={20} className="opacity-40" />
                <span>
                  Drop files here or <span className="font-semibold text-[#00b4d8]">browse</span>
                </span>
              </button>
            ) : (
              <div className="space-y-1.5">
                {attachedFiles.map((af) => (
                  <div
                    key={af.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 px-3 py-2 group"
                  >
                    {getFileIcon(af.type)}
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewFile({
                            id: af.id,
                            name: af.name,
                            size: af.size,
                            type: af.type,
                            url: af.url,
                          })
                        }
                        className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate hover:text-[#00b4d8] text-left block w-full cursor-pointer"
                      >
                        {af.name}
                      </button>
                      <p className="text-[10px] text-slate-400">{formatBytes(af.size)}</p>
                    </div>
                    {af.type.startsWith("image/") && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewFile({
                            id: af.id,
                            name: af.name,
                            size: af.size,
                            type: af.type,
                            url: af.url,
                          })
                        }
                        className="shrink-0 cursor-pointer"
                        title="Click to preview"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={af.url}
                          alt={af.name}
                          className="h-9 w-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-[#00b4d8] transition-all"
                        />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveFile(af.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#00b4d8] hover:underline"
                >
                  + Add another file
                </button>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="pt-2">
            <CommentThread taskId={task.id} taskTitle={task.title} />
          </div>
        </div>

        {/* ── Footer: Save & Delete ── */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3 bg-white dark:bg-[#0f1d31] shrink-0">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 size={13} /> Delete task
          </button>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0033a0] hover:bg-[#002a80] disabled:opacity-40 text-white text-xs font-bold transition-colors"
            >
              <CheckSquare size={13} /> Save task
            </button>
          </div>
        </div>
      </div>

      {/* Discard confirmation */}
      <ConfirmationModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={handleDiscardConfirm}
        variant="discard"
        showCloseButton={false}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        variant="delete"
        title="Delete task?"
        description="This task will be permanently deleted. This action can't be undone."
        showCloseButton={false}
      />

      {/* Inline File Preview (Lightbox) */}
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );

  if (isExpanded) {
    return createPortal(pane, document.body);
  }
  return pane;
}
