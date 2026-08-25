"use client";

import {
  type UserPendingInvite,
  acceptProjectInviteAction,
  declineProjectInviteAction,
  getMyPendingInvitesAction,
} from "@/actions/member-actions";
import { formatRole } from "@/lib/team-data";
import { sileo } from "@/utils/alerts";
import {
  Building2,
  Check,
  Clock,
  FolderKanban,
  Loader2,
  Mail,
  MailCheck,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";

interface MyInvitesTabProps {
  onInviteHandled?: () => void;
}

export function MyInvitesTab({ onInviteHandled }: MyInvitesTabProps) {
  const router = useRouter();
  const [invites, setInvites] = useState<UserPendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadInvites = useCallback(async () => {
    setLoading(true);
    const data = await getMyPendingInvitesAction();
    setInvites(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleAccept = async (invite: UserPendingInvite) => {
    setProcessingId(invite.id);
    const res = await acceptProjectInviteAction(invite.id);
    setProcessingId(null);

    if (res.success) {
      sileo.success(`You have joined "${invite.projectName}"!`, "Invitation Accepted");
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      onInviteHandled?.();
      router.refresh();
    } else {
      sileo.error(res.error || "Failed to accept invitation.", "Error");
    }
  };

  const handleDecline = async (invite: UserPendingInvite) => {
    setProcessingId(invite.id);
    const res = await declineProjectInviteAction(invite.id);
    setProcessingId(null);

    if (res.success) {
      sileo.info(`Declined invitation to "${invite.projectName}".`, "Invitation Declined");
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      onInviteHandled?.();
      router.refresh();
    } else {
      sileo.error(res.error || "Failed to decline invitation.", "Error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0033a0] dark:text-blue-400 mb-3" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading invitations...
        </p>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40 px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0033a0] dark:bg-blue-950/50 dark:text-blue-400">
          <MailCheck className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">No pending invitations</h2>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          When a team lead or project owner invites you to collaborate, their invitation will appear
          here for you to accept or decline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pending Invitations</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Accept invitations to join project teams and workspace channels.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0033a0] dark:text-blue-300">
          {invites.length} {invites.length === 1 ? "Invite" : "Invites"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {invites.map((invite) => {
          const isProcessing = processingId === invite.id;
          const formattedDate = invite.createdAt
            ? new Date(invite.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently";

          return (
            <div
              key={invite.id}
              className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0033a0] dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                        {invite.projectName}
                      </h3>
                      {invite.workspaceName && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{invite.workspaceName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-[#0033a0] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 flex-shrink-0">
                    <Shield className="w-3 h-3" />
                    {formatRole(invite.role)}
                  </span>
                </div>

                {/* Description */}
                {invite.projectDescription && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {invite.projectDescription}
                  </p>
                )}

                {/* Meta details */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      Invited by{" "}
                      <strong className="text-slate-700 dark:text-slate-300 font-medium">
                        {invite.inviterName}
                      </strong>{" "}
                      ({invite.inviterEmail})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Sent on {formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecline(invite)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Decline
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAccept(invite)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0033a0] hover:bg-[#00277a] dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Accept Invitation
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
