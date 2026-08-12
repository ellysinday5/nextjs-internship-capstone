"use client";

import React, { useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { sileo } from "@/utils/alerts";
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

type ModalTab = "Task" | "Doc" | "Reminder" | "Whiteboard" | "Dashboard";

const MODAL_TABS: { id: ModalTab; label: string }[] = [
  { id: "Task", label: "Task" },
  { id: "Doc", label: "Doc" },
  { id: "Reminder", label: "Reminder" },
  { id: "Whiteboard", label: "Whiteboard" },
  { id: "Dashboard", label: "Dashboard" },
];

export function CreateTaskModal({
  isOpen,
  onClose,
  lists = [],
  defaultListId,
  onSuccess,
}: CreateTaskModalProps) {
  const { createTask, createList } = useBoardStore();

  const [activeTab, setActiveTab] = useState<ModalTab>("Task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityType>("Medium");
  const [status, setStatus] = useState<StatusType>("On track");
  const [dueDate, setDueDate] = useState("");
  const [listId, setListId] = useState(defaultListId ?? lists[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

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
    setActiveTab("Task");
    onClose();
  };

  const handleCreateInlineSection = async () => {
    if (!newSectionName.trim()) return;
    setIsCreatingSection(true);
    try {
      await createList(newSectionName.trim());
      sileo.success("Section created!", "Section Added");
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
      sileo.success("Task created!", "Task Created");
      onSuccess?.();
      resetAndClose();
    } catch {
      sileo.error("Failed to create task. Please try again.", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleCloseAttempt}
      >
        <div
          className="relative w-full max-w-2xl bg-white dark:bg-[#1a2b40] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tab Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 px-4 pt-3 pb-0 bg-white dark:bg-[#1a2b40] shrink-0">
            <div className="flex items-center gap-0.5">
              {MODAL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 pb-2">
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "Task" ? (
              <form id="create-task-form" onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
                {/* List breadcrumb */}
                {lists.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={listId || (lists[0]?.id ?? "")}
                      onChange={(e) => setListId(e.target.value)}
                      className="text-xs font-semibold text-[#0033a0] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-1 outline-none focus:ring-2 focus:ring-[#0033a0] cursor-pointer"
                    >
                      {lists.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">Task</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <input
                    required
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setTitleError(null); }}
                    placeholder="Task Name or type '/' for commands"
                    className={`w-full text-lg font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent border-none outline-none py-1 ${titleError ? "border-b-2 border-red-400" : ""}`}
                  />
                  {titleError && <p className="mt-1 text-xs font-semibold text-red-500">{titleError}</p>}
                </div>

                {/* Description */}
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description, or write with AI"
                  className="w-full resize-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 bg-transparent border-none outline-none"
                />

                {/* Status + Action Row */}
                <div className="flex items-center gap-2 flex-wrap border-t border-slate-100 dark:border-slate-800 pt-4">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold border-2 transition-all ${
                        status === opt.value
                          ? opt.value === "On track"
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : opt.value === "At risk"
                              ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-1 flex-wrap">
                    <button type="button" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Assignee
                    </button>
                    <div className="relative inline-block">
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" id="modal-due-date" />
                      <label htmlFor="modal-due-date" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {dueDate ? dueDate : "Due date"}
                      </label>
                    </div>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as PriorityType)} className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 bg-transparent outline-none cursor-pointer appearance-none transition-colors">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button type="button" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                      Tags
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Fields</p>
                  <div className="flex items-center gap-2">
                    <button type="button" className="text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Show custom fields
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSectionInline((v) => !v)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Plus size={11} /> {isAddingSectionInline ? "Cancel" : "Create new field"}
                    </button>
                  </div>
                  {isAddingSectionInline && (
                    <div className="mt-2 flex gap-1.5 animate-in fade-in duration-150">
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateInlineSection(); } }}
                        placeholder="Section name..."
                        className="flex-1 rounded-xl border-2 border-blue-400 px-3 py-2 text-xs text-slate-900 outline-none dark:bg-slate-900 dark:text-slate-100"
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
                  )}
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 gap-2 p-6">
                <div className="text-4xl opacity-40">
                  ??
                </div>
                <p className="text-sm font-semibold">{activeTab} - Coming soon</p>
                <p className="text-xs text-center max-w-xs">This feature is not yet available. Use the Task tab to create tasks.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === "Task" && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#14263e]/50 shrink-0">
              <div className="flex items-center gap-2">
                <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  Templates
                </button>
                <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Attach file">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Notifications">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseAttempt}
                  disabled={isSubmitting}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <div className="inline-flex rounded-xl shadow-sm overflow-hidden">
                  <button
                    type="submit"
                    form="create-task-form"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    {isSubmitting ? "Creating..." : "Create Task"}
                  </button>
                  <button
                    type="button"
                    className="px-2 py-2 bg-violet-700 hover:bg-violet-800 text-white text-sm border-l border-violet-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
