"use client";

import React, { useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { sileo } from "@/utils/alerts";
import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useBoardStore } from "@/stores/board-store";

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

const STATUS_OPTIONS: { value: StatusType; label: string }[] = [
  { value: "On track", label: "On Track" },
  { value: "At risk", label: "At Risk" },
  { value: "Off track", label: "Off Track" },
];

export function CreateTaskModal({
  isOpen,
  onClose,
  lists = [],
  defaultListId,
  onSuccess,
}: CreateTaskModalProps) {
  const { createTask, createList } = useBoardStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityType>("Medium");
  const [status, setStatus] = useState<StatusType>("On track");
  const [dueDate, setDueDate] = useState("");
  const [listId, setListId] = useState(defaultListId ?? lists[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  /* Inline section creation state */
  const [isAddingSectionInline, setIsAddingSectionInline] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [isCreatingSection, setIsCreatingSection] = useState(false);

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
    setIsAddingSectionInline(false);
    setNewSectionName("");
    onClose();
  };

  const handleCreateInlineSection = async () => {
    if (!newSectionName.trim()) return;

    setIsCreatingSection(true);
    try {
      await createList(newSectionName.trim());
      sileo.success(`Section "${newSectionName.trim()}" created!`, "Section Added");

      // Look up updated lists from store or auto-select after delay
      setNewSectionName("");
      setIsAddingSectionInline(false);
    } catch {
      sileo.error("Failed to create section.", "Error");
    } finally {
      setIsCreatingSection(false);
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
        priority,
        status,
        dueDate: dueDate || undefined,
        listId: selectedListId,
      });
      sileo.success(`Task "${title.trim()}" created!`, "Task Created");
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
        title="Create New Task"
        showCloseButton={false}
        maxWidthClassName="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseAttempt}
              disabled={isSubmitting}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-task-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#002a80] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 size={15} />
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Task Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(null);
              }}
              placeholder="e.g. Fix navigation bar hydration bug"
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${titleError
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-[#0033a0] dark:border-slate-700"
                }`}
            />
            {titleError && (
              <p className="mt-1 text-xs font-semibold text-red-500">{titleError}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Description{" "}
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                (optional)
              </span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be done..."
              className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Section / List, Priority, Due Date */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* List / Section with Inline Add Section functionality */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Section
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingSectionInline((v) => !v)}
                  className="text-xs font-bold text-[#0033a0] hover:underline dark:text-blue-400 flex items-center gap-0.5"
                >
                  <Plus size={12} /> {isAddingSectionInline ? "Cancel" : "Add Section"}
                </button>
              </div>

              {isAddingSectionInline ? (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateInlineSection();
                        }
                      }}
                      placeholder="e.g. Backlog, Testing"
                      className="w-full rounded-xl border-2 border-blue-400 px-3 py-2 text-xs text-slate-900 outline-none dark:bg-slate-900 dark:text-slate-100"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateInlineSection}
                      disabled={isCreatingSection || !newSectionName.trim()}
                      className="rounded-xl bg-[#0033a0] px-3 py-2 text-xs font-bold text-white hover:bg-[#002a80] disabled:opacity-50 shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={listId || (lists[0]?.id ?? "")}
                  onChange={(e) => setListId(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {lists.length === 0 ? (
                    <option value="">No sections yet — click + Add Section</option>
                  ) : (
                    lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Priority (Clean text without emojis) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark] focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border-2 transition-all ${status === opt.value
                      ? opt.value === "On track"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : opt.value === "At risk"
                          ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-300"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
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
