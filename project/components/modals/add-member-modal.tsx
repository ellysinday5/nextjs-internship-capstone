"use client";

import React, { useState } from "react";
import { sileo } from "@/utils/alerts";
import { Modal } from "@/components/modals/BaseModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (member: { email: string; role: string }) => void;
}

export function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

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
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    sileo.success(`Invitation sent to ${email} as ${role}!`, "Member Invited");
    onSuccess?.({ email, role });
    resetAndClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title="Add Team Member"
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
              form="add-member-form"
              className="rounded-lg bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#002a80] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send Invitation
            </button>
          </>
        }
      >
        <form id="add-member-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. teammate@company.com"
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Assigned Access Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#0033a0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="Admin">Admin — Full project management & edit rights</option>
              <option value="Member">Member — Can create, edit & complete tasks</option>
              <option value="Viewer">Viewer — Read-only access to projects</option>
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={resetAndClose}
        showCloseButton={false}
        variant="discard"
        title="Discard Invitation?"
        description="You have entered an email address. Are you sure you want to close?"
      />
    </>
  );
}
