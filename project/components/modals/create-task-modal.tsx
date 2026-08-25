"use client";

import type { ProjectMember } from "@/actions/member-actions";
import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import {
  FilePreviewModal,
  type PreviewableFile,
} from "@/components/modals/file-preview-modal";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useBoardStore } from "@/stores/board-store";
import { sileo } from "@/utils/alerts";
import {
  Calendar,
  ChevronRight,
  CircleAlert,
  FileText,
  Film,
  Flag,
  ImageIcon,
  Layers,
  Lock,
  Paperclip,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ListOption {
  id: string;
  name: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists?: ListOption[];
  defaultListId?: string;
  projectName?: string;
  members?: ProjectMember[];
  isLoading?: boolean;
  onSuccess?: () => void;
}

type PriorityType = "Low" | "Medium" | "High";
type StatusType = "On track" | "At risk" | "Off track" | "On hold" | "Complete" | "Dropped";

const PRIORITY_OPTIONS: PriorityType[] = ["Low", "Medium", "High"];

const STATUS_OPTIONS: StatusType[] = [
  "On track",
  "At risk",
  "Off track",
  "On hold",
  "Complete",
  "Dropped",
];

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

function getFileIcon(file: File) {
  if (file.type.startsWith("image/"))
    return <ImageIcon size={15} className="text-sky-500 shrink-0" />;
  if (file.type.startsWith("video/"))
    return <Film size={15} className="text-purple-500 shrink-0" />;
  if (file.type === "application/pdf")
    return <FileText size={15} className="text-rose-500 shrink-0" />;
  return <FileText size={15} className="text-slate-400 shrink-0" />;
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

interface AttachedFile {
  id: string;
  file: File;
  url: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  lists = [],
  defaultListId,
  projectName = "Project",
  members = [],
  isLoading = false,
  onSuccess,
}: CreateTaskModalProps) {
  const { createTask } = useBoardStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("unassigned");
  const [priority, setPriority] = useState<PriorityType>("Medium");
  const [status, setStatus] = useState<StatusType>("On track");
  const [dueDate, setDueDate] = useState("");
  const [listId, setListId] = useState(defaultListId ?? lists[0]?.id ?? "");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultListId) {
      setListId(defaultListId);
    } else if (lists.length > 0 && !listId) {
      setListId(lists[0].id);
    }
  }, [defaultListId, lists, listId]);

  // Clean up object URLs when unmounted or files removed
  useEffect(() => {
    return () => {
      attachedFiles.forEach((af) => URL.revokeObjectURL(af.url));
    };
  }, [attachedFiles]);

  const isDirty = Boolean(
    title.trim() ||
      description.trim() ||
      dueDate ||
      assigneeId !== "unassigned" ||
      attachedFiles.length > 0,
  );

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setAssigneeId("unassigned");
    setPriority("Medium");
    setStatus("On track");
    setDueDate("");
    setListId(defaultListId ?? lists[0]?.id ?? "");
    attachedFiles.forEach((af) => URL.revokeObjectURL(af.url));
    setAttachedFiles([]);
    setTitleError(null);
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newAttachments: AttachedFile[] = files.map((f) => ({
      id: `${Date.now()}-${f.name}`,
      file: f,
      url: URL.createObjectURL(f),
    }));
    setAttachedFiles((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => {
      const toRemove = prev.find((f) => f.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newAttachments: AttachedFile[] = files.map((f) => ({
        id: `${Date.now()}-${f.name}`,
        file: f,
        url: URL.createObjectURL(f),
      }));
      setAttachedFiles((prev) => [...prev, ...newAttachments]);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError(null);
    if (!title.trim()) {
      setTitleError("Task title is required.");
      return;
    }
    const selectedListId = listId || lists[0]?.id;
    if (!selectedListId) {
      sileo.error("Please add or select a section to place this task in.", "No Section");
      return;
    }
    setIsSubmitting(true);
    try {
      await createTask(selectedListId, {
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId: assigneeId !== "unassigned" ? assigneeId : undefined,
        priority,
        status,
        dueDate: dueDate || undefined,
        listId: selectedListId,
      });
      sileo.success("Task created successfully!", "Task Created");
      onSuccess?.();
      resetAndClose();
    } catch {
      sileo.error("Failed to create task. Please try again.", "Error");
    }
  };

  const selectedMember = members.find((m) => (m.userId ?? m.id) === assigneeId);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title="Create Task"
        showCloseButton={true}
        maxWidthClassName="max-w-2xl"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseAttempt}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-task-form"
              disabled={isSubmitting || (lists.length === 0 && !isLoading)}
              className="inline-flex items-center justify-center bg-[#0033a0] hover:bg-[#002a80] text-white px-5 py-2 text-xs font-bold rounded-xl shadow-sm disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        }
      >
        {/* Loading Guard */}
        {isLoading || lists.length === 0 ? (
          <div className="space-y-4 py-4 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full" />
            <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full" />
          </div>
        ) : (
          <form
            id="create-task-form"
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            {/* Title */}
            <div>
              <input
                required
                autoFocus
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleError(null);
                }}
                placeholder="What needs to be done?"
                className={`w-full text-lg font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 border rounded-xl px-3.5 py-2.5 outline-none transition-colors ${
                  titleError
                    ? "border-red-400 focus:ring-2 focus:ring-red-400"
                    : "border-slate-200 dark:border-slate-700 focus:border-[#0033a0] focus:ring-2 focus:ring-[#0033a0]/20"
                }`}
              />
              {titleError && (
                <p className="mt-1 text-xs font-semibold text-red-500">{titleError}</p>
              )}
            </div>

            {/* Properties Container matching Task Details */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 text-sm overflow-hidden bg-white dark:bg-slate-900/40">
              {/* Assignee */}
              <div className="grid grid-cols-[130px_1fr] items-center px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <User size={13} /> Assignee
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0033a0] cursor-pointer"
                  >
                    <option value="unassigned">No assignee</option>
                    {members.map((m) => (
                      <option key={m.userId ?? m.id} value={m.userId ?? m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0033a0] cursor-pointer"
                  />
                  {dueDate ? (
                    <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(dueDate))}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No due date</span>
                  )}
                </div>
              </div>

              {/* Projects & Section */}
              <div className="grid grid-cols-[130px_1fr] items-center px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Layers size={13} /> Projects
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {projectName}
                  </span>
                  <ChevronRight size={12} className="text-slate-400" />
                  <select
                    value={listId || (lists[0]?.id ?? "")}
                    onChange={(e) => setListId(e.target.value)}
                    className="text-xs font-semibold text-[#0033a0] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-[#0033a0] cursor-pointer"
                  >
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div className="grid grid-cols-[130px_1fr] items-center px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Flag size={13} /> Priority
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityType)}
                    className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0033a0] cursor-pointer"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${PRIORITY_STYLE[priority]}`}
                  >
                    {priority}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-[130px_1fr] items-center px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <CircleAlert size={13} /> Status
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusType)}
                    className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0033a0] cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${STATUS_STYLE[status]}`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Description
              </h4>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this task about?"
                className="w-full resize-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-[#0033a0] focus:ring-2 focus:ring-[#0033a0]/20 rounded-xl p-3 outline-none transition-colors"
              />
            </div>

            {/* Attachments Section with Inline Preview */}
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
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-5 text-xs text-slate-400 hover:border-[#0033a0] hover:text-[#0033a0] transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <Paperclip size={20} className="opacity-40" />
                  <span>
                    Drop files here or{" "}
                    <span className="font-semibold text-[#0033a0] dark:text-blue-400">
                      browse
                    </span>
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {attachedFiles.map((af) => (
                    <div
                      key={af.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 px-3 py-2 group"
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
                          className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate hover:text-[#0033a0] dark:hover:text-blue-400 text-left block w-full cursor-pointer"
                        >
                          {af.file.name}
                        </button>
                        <p className="text-[10px] text-slate-400">{formatBytes(af.file.size)}</p>
                      </div>

                      {/* Inline Image Thumbnail with click to preview */}
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
                          className="shrink-0 cursor-pointer group/thumb relative"
                          title="Click to preview inline"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={af.url}
                            alt={af.file.name}
                            className="h-9 w-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-[#0033a0] transition-all"
                          />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(af.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-[#0033a0] dark:text-blue-400 hover:underline cursor-pointer pt-1"
                  >
                    + Add another file
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* Discard Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={resetAndClose}
        variant="discard"
        showCloseButton={false}
      />

      {/* Inline File Preview Modal (Lightbox) without page redirect */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </>
  );
}
