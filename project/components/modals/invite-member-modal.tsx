"use client"

import { useState } from "react"
import { UserPlus, Mail } from "lucide-react"
import { sileo } from "@/utils/alerts"
import { Modal } from "@/components/modals/BaseModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"

export interface InviteMemberData {
  email: string
  role: "Admin" | "Member"
}

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (data: InviteMemberData) => void
  projectName?: string
  projectDescription?: string | null
}

const ROLE_OPTIONS: { value: InviteMemberData["role"]; label: string; description: string }[] = [
  {
    value: "Admin",
    label: "Admin",
    description: "Can manage teams, invite members, and configure workspace settings.",
  },
  {
    value: "Member",
    label: "Member",
    description: "Can collaborate on projects, tasks, and team discussions.",
  },
]

export function InviteMemberModal({ isOpen, onClose, onInvite, projectName, projectDescription }: InviteMemberModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<InviteMemberData["role"]>("Member")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const isDirty = Boolean(email.trim())

  const resetAndClose = () => {
    setEmail("")
    setRole("Member")
    setEmailError(null)
    setShowDiscardConfirm(false)
    onClose()
  }

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true)
      return
    }
    resetAndClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setEmailError("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 400))
    onInvite({ email: trimmedEmail, role })
    sileo.success(`Invitation sent to ${trimmedEmail}!`, "Member Invited")
    setIsSubmitting(false)
    resetAndClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title="Invite Team Member"
        showCloseButton={false}
        maxWidthClassName="max-w-xl"
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
              form="invite-member-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#142843] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f1f35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus size={15} />
              {isSubmitting ? "Sending..." : "Send Invite"}
            </button>
          </>
        }
      >
        <form id="invite-member-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Project info banner */}
          {projectName && (
            <div className="rounded-xl border border-[#142843]/20 bg-[#142843]/5 dark:border-blue-800/30 dark:bg-blue-950/20 p-3.5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#142843]/60 dark:text-blue-400/60 mb-1">Inviting to project</p>
              <p className="text-sm font-bold text-[#142843] dark:text-blue-300">{projectName}</p>
              {projectDescription && (
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">{projectDescription}</p>
              )}
            </div>
          )}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
              <Mail size={14} className="text-[#142843] dark:text-blue-400" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError(null)
              }}
              placeholder="e.g. teammate@company.com"
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                emailError
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-[#142843] dark:border-slate-700"
              }`}
            />
            {emailError && (
              <p className="mt-1 text-xs font-semibold text-red-500">{emailError}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Access Role
            </label>
            <div className="space-y-2.5">
              {ROLE_OPTIONS.map((opt) => {
                const isSelected = role === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`w-full rounded-xl border-2 p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-[#142843] bg-[#142843]/5 dark:border-blue-500 dark:bg-blue-950/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="text-sm font-bold text-[#142843] dark:text-slate-100">
                      {opt.label}
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {opt.description}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={resetAndClose}
        showCloseButton={false}
        variant="discard"
        title="Discard Changes?"
        description="You have entered an email address. Are you sure you want to close?"
      />
    </>
  )
}
