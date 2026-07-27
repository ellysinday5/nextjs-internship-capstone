"use client"

import React, { useState } from "react"
import { Users, Mail, Shield, Plus, X } from "lucide-react"
import { sileo, swal } from "@/utils/alerts"

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (member: { email: string; role: string }) => void
}

export function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Member")

  if (!isOpen) return null

  const handleCloseAttempt = async () => {
    if (email.trim()) {
      const confirm = await swal.confirm(
        "Discard Invitation?",
        "You have entered an email address. Are you sure you want to close?"
      )
      if (!confirm) return
    }
    resetAndClose()
  }

  const resetAndClose = () => {
    setEmail("")
    setRole("Member")
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    sileo.success(`Invitation sent to ${email} as ${role}!`, "Member Invited")
    onSuccess?.({ email, role })
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
            <div className="w-10 h-10 bg-[#6c7fd8] rounded-xl flex items-center justify-center shadow-md">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#142843] dark:text-white">
                Add Team Member
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Invite a colleague to join your team workspace
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
            <label className="block text-sm font-bold text-[#142843] dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Mail size={15} className="text-[#6c7fd8]" /> Email Address <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. teammate@company.com"
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-[#142843] text-[#142843] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#6c7fd8] transition-colors"
              suppressHydrationWarning
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#142843] dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Shield size={15} className="text-[#6c7fd8]" /> Assigned Access Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-[#142843] text-[#142843] dark:text-white focus:outline-none focus:border-[#6c7fd8] transition-colors"
              suppressHydrationWarning
            >
              <option value="Admin">Admin — Full project management & edit rights</option>
              <option value="Member">Member — Can create, edit & complete tasks</option>
              <option value="Viewer">Viewer — Read-only access to projects</option>
            </select>
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
              className="px-6 py-3 bg-[#6c7fd8] hover:bg-[#5a6dc4] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              suppressHydrationWarning
            >
              <Plus size={18} />
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
