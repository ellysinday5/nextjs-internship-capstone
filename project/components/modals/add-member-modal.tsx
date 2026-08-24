"use client";

import { inviteTeamMember } from "@/actions/invite-member";
import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { sileo } from "@/utils/alerts";
import { FolderKanban, Mail, Shield, UserPlus, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface ProjectOption {
  id: string;
  name: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  projectOptions: ProjectOption[];
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLE_OPTIONS = [
  {
    value: "Project Manager",
    label: "Project Manager",
    description: "Full access — can add/remove members, manage tasks, and configure the project",
    Icon: Shield,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-300 dark:border-blue-700",
  },
  {
    value: "Member",
    label: "Member",
    description:
      "Can add tasks, edit/delete their own tasks, reply to comments, and message teammates",
    Icon: Users,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-700",
  },
];

export function AddMemberModal({
  isOpen,
  projectOptions,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Default to the first available project whenever the modal opens
  // or the list of projects changes.
  useEffect(() => {
    if (isOpen && !selectedProjectId && projectOptions.length > 0) {
      setSelectedProjectId(projectOptions[0].id);
    }
  }, [isOpen, projectOptions, selectedProjectId]);

  const isDirty = Boolean(email.trim());

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setEmail("");
    setRole("Member");
    setSelectedProjectId("");
    setServerError(null);
    setEmailError(null);
    setProjectError(null);
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setProjectError(null);
    setServerError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const targetProjectId = selectedProjectId || projectOptions[0]?.id;
    if (!targetProjectId) {
      setServerError("No project found to add member to.");
      return;
    }

    setIsSubmitting(true);
    const res = await inviteTeamMember(targetProjectId, trimmedEmail, role);
    setIsSubmitting(false);

    if (res.success) {
      sileo.success(
        `Invitation sent to ${trimmedEmail} as ${role}. They'll appear in the team list once they accept.`,
        "Invitation Sent",
      );
      onSuccess?.();
      resetAndClose();
    } else {
      setServerError(res.error || "Failed to send invite.");
      sileo.error(res.error || "Failed to send invite.", "Error");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title="Add Team Member"
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
              form="add-member-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#002a80] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus size={15} />
              {isSubmitting ? "Sending..." : "Add Member"}
            </button>
          </>
        }
      >
        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {serverError}
          </div>
        )}

        <form id="add-member-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Address */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-[#0033a0] dark:text-blue-400" />
                Email Address <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              placeholder="e.g. teammate@company.com"
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                emailError
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-[#0033a0] dark:border-slate-700"
              }`}
            />
            {emailError && <p className="mt-1 text-xs font-semibold text-red-500">{emailError}</p>}
          </div>

          {/* Role selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Access Role
            </label>
            <div className="space-y-2.5">
              {ROLE_OPTIONS.map((opt) => {
                const isSelected = role === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`w-full flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                      isSelected
                        ? `${opt.border} ${opt.bg}`
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isSelected ? opt.bg : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      <opt.Icon size={15} className={isSelected ? opt.color : "text-slate-400"} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-bold ${
                          isSelected ? opt.color : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {opt.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div
                        className={`ml-auto mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center ${opt.bg} ${opt.border} border`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${opt.color.replace("text-", "bg-")}`}
                        />
                      </div>
                    )}
                  </button>
                );
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
  );
}
