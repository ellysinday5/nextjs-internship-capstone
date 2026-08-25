"use client";

import type { NotificationWithActor } from "@/actions/notification-actions";
import {
  acceptProjectInvitationNotificationAction,
  declineProjectInvitationNotificationAction,
} from "@/actions/notification-actions";
import { Modal } from "@/components/modals/BaseModal";
import { sileo } from "@/utils/alerts";
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  Loader2,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InvitationDetailModalProps {
  notification: NotificationWithActor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InvitationDetailModal({
  notification,
  isOpen,
  onClose,
  onSuccess,
}: InvitationDetailModalProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);

  if (!notification) return null;

  const metadata = (notification.metadata ?? {}) as {
    projectId?: string;
    projectName?: string;
    role?: string;
  };

  const projectName =
    metadata.projectName ||
    notification.message?.match(/join "([^"]+)"/)?.[1] ||
    "Project";

  const inviterName = notification.actor?.name || "A team member";
  const inviterEmail = notification.actor?.email;
  const role = metadata.role || "Member";

  const formattedDate = notification.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(notification.createdAt))
    : "";

  const handleModalClose = () => {
    setIsJoined(false);
    setDestinationUrl(null);
    onClose();
  };

  async function handleAccept() {
    if (!notification) return;
    setIsAccepting(true);
    try {
      const res = await acceptProjectInvitationNotificationAction(notification.id);
      if (res.success) {
        sileo.success(`Joined "${projectName}" successfully!`);
        onSuccess?.();
        const destination = res.projectSlug ?? res.projectId;
        if (destination) {
          setDestinationUrl(`/projects/${destination}`);
        }
        setIsJoined(true);
      } else {
        sileo.error(("error" in res && res.error) || "Failed to accept invitation.");
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
      sileo.error("An unexpected error occurred.");
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleDecline() {
    if (!notification) return;
    setIsDeclining(true);
    try {
      const res = await declineProjectInvitationNotificationAction(notification.id);
      if (res.success) {
        sileo.info("Invitation declined.");
        onSuccess?.();
        handleModalClose();
      } else {
        sileo.error(res.error || "Failed to decline invitation.");
      }
    } catch (err) {
      console.error("Error declining invite:", err);
      sileo.error("An unexpected error occurred.");
    } finally {
      setIsDeclining(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={isJoined ? "Invitation Accepted" : "Project Invitation"}
      maxWidthClassName="max-w-md"
      footer={
        isJoined ? (
          <div className="flex w-full items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              Dismiss
            </button>
            {destinationUrl && (
              <button
                type="button"
                onClick={() => {
                  handleModalClose();
                  router.push(destinationUrl);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0033a0] hover:bg-[#002a80] rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <span>Go to Project &rarr;</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleDecline}
              disabled={isAccepting || isDeclining}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50 border border-slate-200 dark:border-slate-700"
            >
              {isDeclining ? (
                <Loader2 size={13} className="animate-spin text-rose-500" />
              ) : (
                <XCircle size={13} />
              )}
              <span>Decline</span>
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0033a0] hover:bg-[#002a80] rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {isAccepting ? (
                <Loader2 size={13} className="animate-spin text-white" />
              ) : (
                <CheckCircle2 size={13} />
              )}
              <span>Accept Invitation</span>
            </button>
          </div>
        )
      }
    >
      {isJoined ? (
        <div className="py-4 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner animate-bounce">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Welcome to {projectName}!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              You have successfully joined as a <strong className="text-slate-700 dark:text-slate-200 capitalize">{role}</strong>. You now have full access to view tasks and collaborate with the team.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Project & Inviter Banner */}
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-[#14263e]/60 dark:via-[#102035]/40 dark:to-slate-900/60 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0033a0] text-white flex items-center justify-center shrink-0 shadow-sm">
                <FolderKanban size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                  Collaboration Invite
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {projectName}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-100">{inviterName}</strong> invited
              you to join this project team.
            </p>
          </div>

          {/* Details card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <User size={13} /> Inviter
              </span>
              <div className="text-right">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {inviterName}
                </span>
                {inviterEmail && (
                  <span className="block text-[10px] text-slate-400">{inviterEmail}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Shield size={13} /> Offered Role
              </span>
              <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 capitalize">
                {role}
              </span>
            </div>

            {formattedDate && (
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                  <Calendar size={13} /> Invited Date
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {formattedDate}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
