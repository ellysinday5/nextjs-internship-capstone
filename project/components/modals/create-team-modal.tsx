"use client";

import { Modal } from "@/components/modals/BaseModal";
import { type CreateTeamFormValues, createTeamSchema } from "@/lib/db/team-schemas";
import { formatRole } from "@/lib/team-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Plus, Shield, User, UserCheck, UserPlus, Users, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export interface QueuedInvite {
  email: string;
  role: string;
}

export interface CreateTeamData extends CreateTeamFormValues {
  invites?: QueuedInvite[];
}

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateTeamData) => Promise<void> | void;
}

export function CreateTeamModal({ isOpen, onClose, onCreate }: CreateTeamModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: "", description: "" },
  });

  const [queuedInvites, setQueuedInvites] = useState<QueuedInvite[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("Member");
  const [emailError, setEmailError] = useState("");

  const handleAddMember = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    setEmailError("");

    const trimmed = memberEmail.trim().toLowerCase();
    if (!trimmed) {
      setEmailError("Email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (queuedInvites.some((inv) => inv.email.toLowerCase() === trimmed)) {
      setEmailError("This email has already been added to the invite list.");
      return;
    }

    setQueuedInvites((prev) => [...prev, { email: trimmed, role: memberRole }]);
    setMemberEmail("");
    setEmailError("");
  };

  const handleRemoveMember = (indexToRemove: number) => {
    setQueuedInvites((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (data: CreateTeamFormValues) => {
    await onCreate({
      ...data,
      invites: queuedInvites,
    });
    handleClose();
  };

  const handleClose = () => {
    reset();
    setQueuedInvites([]);
    setMemberEmail("");
    setMemberRole("Member");
    setEmailError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Team"
      showCloseButton={false}
      maxWidthClassName="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-team-form"
            disabled={isSubmitting}
            className="rounded-lg bg-[#142843] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f1f35] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            {isSubmitting ? "Creating Team..." : "Create Team"}
          </button>
        </>
      }
    >
      <form
        id="create-team-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {/* Team Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="e.g. Product Engineering"
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
              errors.name
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-[#142843] dark:border-slate-700"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs font-semibold text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Description <span className="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={2}
            {...register("description")}
            placeholder="What is this team responsible for?"
            className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#142843] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Inline Member Invites */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UserPlus size={15} className="text-[#0033a0]" />
              Invite Initial Members
            </label>
            <span className="text-xs text-slate-400">
              {queuedInvites.length} {queuedInvites.length === 1 ? "invite" : "invites"} added
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Add team members now. They will receive an invitation email and immediate access.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => {
                  setMemberEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                placeholder="colleague@company.com"
                className="w-full rounded-xl border-2 border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#142843] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="rounded-xl border-2 border-slate-200 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-[#142843] dark:border-slate-700"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>

            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {emailError && (
            <p className="mt-1 text-xs font-semibold text-red-500">{emailError}</p>
          )}

          {/* Queued Invites List */}
          {queuedInvites.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {queuedInvites.map((inv, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#0033a0] dark:text-blue-300 font-bold text-[10px]">
                      {inv.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {inv.email}
                    </span>
                    <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {formatRole(inv.role)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg"
                    title="Remove invite"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
