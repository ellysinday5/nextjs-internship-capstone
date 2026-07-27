"use client"

import React, { useState } from "react"
import { CheckCircle2, Flag, Calendar, Tag, Plus, X } from "lucide-react"
import { sileo, swal } from "@/utils/alerts"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (task: { title: string; priority: string; due: string; label: string }) => void
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [due, setDue] = useState("")
  const [label, setLabel] = useState("")

  if (!isOpen) return null

  const handleCloseAttempt = async () => {
    if (title.trim() || due || label.trim()) {
      const confirm = await swal.confirm(
        "Discard Task?",
        "You have unsaved task data. Are you sure you want to close?"
      )
      if (!confirm) return
    }
    resetAndClose()
  }

  const resetAndClose = () => {
    setTitle("")
    setPriority("Medium")
    setDue("")
    setLabel("")
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    sileo.success(`Task "${title}" created successfully!`, "Task Created")
    onSuccess?.({ title, priority, due, label })
    resetAndClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseAttempt()
      }}
    >
      <div className="bg-white dark:bg-[#1a2e4a] rounded-2xl shadow-2xl w-full max-w-xl border border-[#142843]/20 dark:border-white/10 overflow-hidden animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#14263e]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#52cba3] rounded-xl flex items-center justify-center shadow-md">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#142843] dark:text-white">
                Create New Task
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add a new task item to your project board
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAttempt}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#142843] dark:text-slate-200 mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix navigation bar hydration bug"
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-[#142843] text-[#142843] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#52cba3] transition-colors"
              suppressHydrationWarning
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#142843] dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Flag size={14} className="text-[#52cba3]" /> Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-[#142843] text-[#142843] dark:text-white focus:outline-none focus:border-[#52cba3] transition-colors"
                suppressHydrationWarning
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#142843] dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#52cba3]" /> Due Date
              </label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-[#142843] text-[#142843] dark:text-white focus:outline-none focus:border-[#52cba3] transition-colors"
                suppressHydrationWarning
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#142843] dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Tag size={14} className="text-[#52cba3]" /> Task Tag / Category
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. bug, frontend, design-system"
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-[#142843] text-[#142843] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#52cba3] transition-colors"
              suppressHydrationWarning
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="px-5 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-[#142843] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              suppressHydrationWarning
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#52cba3] hover:bg-[#3db88f] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              suppressHydrationWarning
            >
              <Plus size={18} />
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
