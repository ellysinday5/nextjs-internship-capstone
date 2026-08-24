"use client";

import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useBoardStore } from "@/stores/board-store";
import { sileo } from "@/utils/alerts";
import { Calendar, CheckCircle2, Flag, Layers, Paperclip } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface ListOption {
  id: string;
  name: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists?: ListOption[];
  defaultListId?: string;
  onSuccess?: () => void;
}

type PriorityType = "Low" | "Medium" | "High";
type StatusType = "On track" | "At risk" | "Off track" | "On hold" | "Complete" | "Dropped";

const PRIORITY_OPTIONS: { value: PriorityType; label: string }[] = [
  { value: "High", label: "High Priority" },
  { value: "Medium", label: "Medium Priority" },
  { value: "Low", label: "Low Priority" },
];

export function CreateTaskModal({
  isOpen,
  onClose,
  lists = [],
  defaultListId,
  onSuccess,
}: CreateTaskModalProps) {
  const { createTask } = useBoardStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityType>("Medium");
  const [status, setStatus] = useState<StatusType>("On track");
  const [dueDate, setDueDate] = useState("");
  const [listId, setListId] = useState(defaultListId ?? lists[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const isDirty = Boolean(title.trim() || description.trim() || dueDate);

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
    setPriority("Medium");
    setStatus("On track");
    setDueDate("");
    setListId(defaultListId ?? lists[0]?.id ?? "");
    setTitleError(null);
    setShowDiscardConfirm(false);
    onClose();
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
        priority,
        status,
        dueDate: dueDate || undefined,
        listId: selectedListId,
      });
      sileo.success("Task created!", "Task Created");
      onSuccess?.();
      resetAndClose();
    } catch {
      sileo.error("Failed to create task. Please try again.", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title="Create Task"
        showCloseButton={false}
        maxWidthClassName="max-w-2xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Attach file"
              >
                <Paperclip size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseAttempt}
                disabled={isSubmitting}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-task-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-[#0033a0] hover:bg-[#002a80] text-white px-5 py-2 text-sm font-bold rounded-xl shadow-sm disabled:opacity-60 transition-colors"
              >
                <CheckCircle2 size={15} />
                {isSubmitting ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        }
      >
        <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Section Selector */}
          {lists.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Layers size={13} />
                <span>Section:</span>
              </div>
              <select
                value={listId || (lists[0]?.id ?? "")}
                onChange={(e) => setListId(e.target.value)}
                className="text-xs font-semibold text-[#0033a0] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-1 outline-none focus:ring-2 focus:ring-[#0033a0] cursor-pointer"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            {titleError && <p className="mt-1 text-xs font-semibold text-red-500">{titleError}</p>}
          </div>

          {/* Description */}
          <div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or acceptance criteria..."
              className="w-full resize-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-[#0033a0] focus:ring-2 focus:ring-[#0033a0]/20 rounded-xl p-3 outline-none transition-colors"
            />
          </div>

          {/* Controls: Due Date & Priority */}
          <div className="flex items-center gap-3 flex-wrap border-t border-slate-100 dark:border-slate-800 pt-3">
            {/* Due Date */}
            <div className="relative inline-block">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                id="modal-due-date"
              />
              <label
                htmlFor="modal-due-date"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                <Calendar size={13} className="text-slate-400" />
                {dueDate ? dueDate : "Set due date"}
              </label>
            </div>

            {/* Priority */}
            <div className="relative inline-flex items-center">
              <Flag size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
                className="pl-7 pr-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 bg-transparent outline-none cursor-pointer appearance-none transition-colors"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={resetAndClose}
        variant="discard"
        showCloseButton={false}
      />
    </>
  );
}
