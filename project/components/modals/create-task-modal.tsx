"use client";

import React, { useState } from "react";
import { sileo } from "@/utils/alerts";
import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (task: { title: string; priority: string; due: string; label: string }) => void;
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState("");
  const [label, setLabel] = useState("");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const isDirty = Boolean(title.trim() || due || label.trim());

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setTitle("");
    setPriority("Medium");
    setDue("");
    setLabel("");
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sileo.success(`Task "${title}" created successfully!`, "Task Created");
    onSuccess?.({ title, priority, due, label });
    resetAndClose();
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
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-task-form"
              className="rounded-lg bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#002a80] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create Task
            </button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix navigation bar hydration bug"
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Due Date
              </label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-[#0033a0]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Task Tag / Category
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. bug, frontend, design-system"
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
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
