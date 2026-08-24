"use client";

import {
  type CommentRecord,
  createCommentAction,
  deleteCommentAction,
  getTaskCommentsAction,
  updateCommentAction,
} from "@/actions/comment-actions";
import type { ProjectMember } from "@/actions/member-actions";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { FilePreviewModal, type PreviewableFile } from "@/components/modals/file-preview-modal";
import { useUser } from "@clerk/nextjs";
import {
  Archive,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  CircleAlert,
  Edit2,
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
  MoreHorizontal,
  Paperclip,
  Reply,
  Send,
  ThumbsUp,
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
  file: File;
  url: string;
}

function getFileIcon(file: File) {
  if (file.type.startsWith("image/"))
    return <ImageIcon size={14} className="text-sky-500 shrink-0" />;
  if (file.type.startsWith("video/"))
    return <Film size={14} className="text-purple-500 shrink-0" />;
  if (file.type === "application/pdf")
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

  // Comments state
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch comments on mount and whenever active task changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingComments(true);
    setReplyingTo(null);
    setEditingCommentId(null);
    setEditingText("");
    setCommentText("");

    getTaskCommentsAction(task.id)
      .then((res) => {
        if (isMounted && res.success) {
          setComments(res.comments);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingComments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [task.id]);

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

  // Submit comment / reply with optimistic update
  async function handleSendComment(e: React.FormEvent) {
    e.preventDefault();
    const content = commentText.trim();
    if (!content || isSubmittingComment) return;

    const parentId = replyingTo?.id;
    const tempId = `temp-${Date.now()}`;
    const currentUserName =
      clerkUser?.fullName ||
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
      clerkUser?.username ||
      "You";

    const optimisticComment: CommentRecord = {
      id: tempId,
      taskId: task.id,
      authorId: clerkUser?.id || "",
      author: {
        id: clerkUser?.id || "",
        name: currentUserName,
        email: clerkUser?.primaryEmailAddress?.emailAddress || "",
        clerkId: clerkUser?.id || "",
      },
      content,
      parentCommentId: parentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
    };

    // Optimistically update local UI state
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...c.replies, optimisticComment] } : c,
        ),
      );
    } else {
      setComments((prev) => [...prev, optimisticComment]);
    }

    setCommentText("");
    setReplyingTo(null);
    setIsSubmittingComment(true);

    try {
      const res = await createCommentAction(task.id, content, parentId);
      if (res.success && res.comment) {
        const confirmed = res.comment;
        if (parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    replies: c.replies.map((r) => (r.id === tempId ? confirmed : r)),
                  }
                : c,
            ),
          );
        } else {
          setComments((prev) => prev.map((c) => (c.id === tempId ? confirmed : c)));
        }
      } else {
        const refetch = await getTaskCommentsAction(task.id);
        if (refetch.success) setComments(refetch.comments);
      }
    } catch (err) {
      console.error("[TaskDetailsPane] Error sending comment:", err);
      const refetch = await getTaskCommentsAction(task.id);
      if (refetch.success) setComments(refetch.comments);
    } finally {
      setIsSubmittingComment(false);
    }
  }

  function handleStartEdit(comment: CommentRecord) {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  }

  function handleCancelEdit() {
    setEditingCommentId(null);
    setEditingText("");
  }

  async function handleSaveEdit(commentId: string) {
    const trimmed = editingText.trim();
    if (!trimmed || trimmed === "[deleted]") return;

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, content: trimmed, updatedAt: new Date() };
        }
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId ? { ...r, content: trimmed, updatedAt: new Date() } : r,
          ),
        };
      }),
    );

    setEditingCommentId(null);
    setEditingText("");

    try {
      const res = await updateCommentAction(commentId, trimmed);
      if (!res.success) {
        const refetch = await getTaskCommentsAction(task.id);
        if (refetch.success) setComments(refetch.comments);
      }
    } catch (err) {
      console.error("[TaskDetailsPane] Error updating comment:", err);
      const refetch = await getTaskCommentsAction(task.id);
      if (refetch.success) setComments(refetch.comments);
    }
  }

  async function handleDeleteComment(commentId: string) {
    setComments(
      (prev) =>
        prev
          .map((c) => {
            if (c.id === commentId) {
              if (c.replies.length > 0) {
                return { ...c, content: "[deleted]" };
              }
              return null;
            }
            return {
              ...c,
              replies: c.replies.filter((r) => r.id !== commentId),
            };
          })
          .filter(Boolean) as CommentRecord[],
    );

    try {
      const res = await deleteCommentAction(commentId);
      if (!res.success) {
        const refetch = await getTaskCommentsAction(task.id);
        if (refetch.success) setComments(refetch.comments);
      }
    } catch (err) {
      console.error("[TaskDetailsPane] Error deleting comment:", err);
      const refetch = await getTaskCommentsAction(task.id);
      if (refetch.success) setComments(refetch.comments);
    }
  }

  function handleInitiateReply(parentCommentId: string, authorName: string) {
    setReplyingTo({ id: parentCommentId, authorName });
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 50);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newAttachments: AttachedFile[] = files.map((f) => ({
      id: `${Date.now()}-${f.name}`,
      file: f,
      url: URL.createObjectURL(f),
    }));
    setAttachedFiles((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  }

  function handleRemoveFile(id: string) {
    setAttachedFiles((prev) => {
      const toRemove = prev.find((f) => f.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.url);
      return prev.filter((f) => f.id !== id);
    });
  }

  useEffect(() => {
    return () => {
      attachedFiles.forEach((af) => URL.revokeObjectURL(af.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentInitials = getInitials(
    clerkUser?.fullName ||
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
      "You",
  );

  const paneClass = isExpanded
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    : "contents";

  const innerClass = isExpanded
    ? "relative w-full max-w-5xl h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d31] flex flex-col shadow-2xl overflow-hidden"
    : "w-[560px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31] flex flex-col h-full shadow-2xl z-20";

  const renderCommentRow = (c: CommentRecord, isReply = false) => {
    const isDeleted = c.content === "[deleted]";
    const isAuthor = clerkUser?.id === c.authorId || clerkUser?.id === c.author?.clerkId;
    const authorName = isDeleted ? "Deleted comment" : c.author?.name || "Member";
    const initials = getInitials(authorName);
    const isEditing = editingCommentId === c.id;
    const isEdited =
      !isDeleted &&
      c.updatedAt &&
      c.createdAt &&
      new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime() > 2000;

    return (
      <div key={c.id} id={`comment-${c.id}`} className="group flex items-start gap-2.5">
        <span
          className={`flex shrink-0 items-center justify-center rounded-full font-bold ${
            isReply
              ? "h-5 w-5 text-[8px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
              : "h-6 w-6 text-[9px] bg-amber-400 text-amber-950"
          }`}
        >
          {initials}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
              {authorName}
            </span>
            <span className="text-[10px] text-slate-400">{formatCommentTime(c.createdAt)}</span>
            {isEdited && <span className="text-[10px] text-slate-400 italic">(edited)</span>}
          </div>

          {isDeleted ? (
            <p className="text-xs italic text-slate-400 dark:text-slate-500 mt-0.5">
              [This comment was deleted]
            </p>
          ) : isEditing ? (
            <div className="mt-1 space-y-1.5">
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d31] px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-[#00b4d8]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit(c.id);
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[10px] px-2 py-0.5 rounded text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(c.id)}
                  className="text-[10px] px-2.5 py-0.5 rounded bg-[#0033a0] text-white font-medium hover:bg-[#002a80] cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 whitespace-pre-wrap break-words">
              {c.content}
            </p>
          )}

          {/* Action affordances */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => handleInitiateReply(c.parentCommentId || c.id, authorName)}
                className="hover:text-[#00b4d8] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Reply size={11} className="rotate-180" /> Reply
              </button>
              {!isDeleted && isAuthor && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(c)}
                    className="hover:text-[#00b4d8] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c.id)}
                    className="hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

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

        {/* ── Privacy bar ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#14263e] border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock size={12} className="text-amber-500 shrink-0" />
            This task is private to members of this project.
          </span>
          <button className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-semibold">
            Make public
          </button>
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
                    value={assignee?.id || "unassigned"}
                    onChange={(e) => {
                      setIsEditingAssignee(false);
                      const val = e.target.value;
                      if (val === "unassigned") {
                        setAssignee(undefined);
                        return;
                      }
                      const found = members.find((m) => m.id === val);
                      if (found) {
                        setAssignee({
                          id: found.id,
                          name: found.name,
                          initials: getInitials(found.name),
                        });
                      }
                    }}
                    onBlur={() => setIsEditingAssignee(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100"
                  >
                    <option value="unassigned">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
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
                    {getFileIcon(af.file)}
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewFile({
                            id: af.id,
                            name: af.file.name,
                            size: af.file.size,
                            type: af.file.type,
                            url: af.url,
                          })
                        }
                        className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate hover:text-[#00b4d8] text-left block w-full cursor-pointer"
                      >
                        {af.file.name}
                      </button>
                      <p className="text-[10px] text-slate-400">{formatBytes(af.file.size)}</p>
                    </div>
                    {af.file.type.startsWith("image/") && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewFile({
                            id: af.id,
                            name: af.file.name,
                            size: af.file.size,
                            type: af.file.type,
                            url: af.url,
                          })
                        }
                        className="shrink-0 cursor-pointer"
                        title="Click to preview"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={af.url}
                          alt={af.file.name}
                          className="h-9 w-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-[#00b4d8] transition-all"
                        />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveFile(af.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Remove"
                    >
                      <X size={13} />
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Comments{" "}
                {comments.length > 0 &&
                  `(${comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})`}
              </h4>
              {isLoadingComments && <Loader2 size={13} className="animate-spin text-slate-400" />}
            </div>

            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="space-y-2.5">
                    {renderCommentRow(c, false)}
                    {c.replies && c.replies.length > 0 && (
                      <div className="ml-7 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-3 mt-2.5">
                        {c.replies.map((r) => renderCommentRow(r, true))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : !isLoadingComments ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                No comments yet. Start the conversation!
              </p>
            ) : null}
          </div>
        </div>

        {/* ── Comment input ── */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#14263e] shrink-0">
          {replyingTo && (
            <div className="flex items-center justify-between px-4 py-1.5 bg-sky-50 dark:bg-sky-950/40 text-[11px] text-sky-700 dark:text-sky-300 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 truncate">
                <Reply size={12} className="rotate-180 shrink-0" />
                <span>
                  Replying to <strong className="font-semibold">{replyingTo.authorName}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                title="Cancel reply"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <form onSubmit={handleSendComment} className="flex items-center gap-2.5 px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">
              {currentInitials}
            </span>
            <div className="flex-1 relative">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  replyingTo ? `Write a reply to ${replyingTo.authorName}…` : "Write a comment…"
                }
                disabled={isSubmittingComment}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d31] px-3 py-2 pr-9 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-[#00b4d8] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00b4d8] disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isSubmittingComment ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </div>
          </form>
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
