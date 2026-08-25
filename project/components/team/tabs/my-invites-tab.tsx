"use client";

import {
  type UserPendingInvite,
  type UserSentInvite,
  acceptProjectInviteAction,
  declineProjectInviteAction,
  getMyPendingInvitesAction,
  getMySentInvitesAction,
  revokeSentInviteAction,
} from "@/actions/member-actions";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { formatRole } from "@/lib/team-data";
import { sileo } from "@/utils/alerts";
import {
  AlertCircle,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  FolderKanban,
  Inbox,
  Loader2,
  MailCheck,
  Send,
  Shield,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface MyInvitesTabProps {
  onInviteHandled?: () => void;
}

type SubTab = "received" | "sent";
type SentFilter = "all" | "pending" | "accepted" | "expired" | "revoked";

export function MyInvitesTab({ onInviteHandled }: MyInvitesTabProps) {
  const router = useRouter();

  const [subTab, setSubTab] = useState<SubTab>("received");
  const [receivedInvites, setReceivedInvites] = useState<UserPendingInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<UserSentInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [sentFilter, setSentFilter] = useState<SentFilter>("all");

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    variant: "accept" | "decline" | "delete";
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    variant: "accept",
    title: "",
    description: "",
    confirmLabel: "",
    onConfirm: async () => {},
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingData, sentData] = await Promise.all([
        getMyPendingInvitesAction(),
        getMySentInvitesAction(),
      ]);
      setReceivedInvites(pendingData);
      setSentInvites(sentData);
    } catch (err) {
      console.error("Failed to load invites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Prompt confirmation for accepting an invite
  const handlePromptAccept = (invite: UserPendingInvite) => {
    setConfirmModal({
      isOpen: true,
      variant: "accept",
      title: `Join "${invite.projectName}"?`,
      description: `You will gain access to tasks, boards, and collaborate with members in "${invite.workspaceName || "this workspace"}".`,
      confirmLabel: "Accept & Join",
      onConfirm: async () => {
        setProcessingId(invite.id);
        const res = await acceptProjectInviteAction(invite.id);
        setProcessingId(null);

        if (res.success) {
          const wsName = res.workspaceName || invite.workspaceName;
          if (res.isDifferentWorkspace && wsName) {
            sileo.success(
              `You've joined "${invite.projectName}"! You can switch to "${wsName}" anytime via the Workspace Switcher.`,
              "Invitation Accepted",
            );
          } else {
            sileo.success(`You've joined "${invite.projectName}"!`, "Invitation Accepted");
          }
          setReceivedInvites((prev) => prev.filter((i) => i.id !== invite.id));
          onInviteHandled?.();
          router.refresh();
        } else {
          sileo.error(res.error || "Failed to accept invitation.", "Error");
        }
      },
    });
  };

  // Prompt confirmation for declining an invite
  const handlePromptDecline = (invite: UserPendingInvite) => {
    setConfirmModal({
      isOpen: true,
      variant: "decline",
      title: `Decline Invitation?`,
      description: `Are you sure you want to decline the invitation to join "${invite.projectName}"? This action cannot be undone.`,
      confirmLabel: "Decline",
      onConfirm: async () => {
        setProcessingId(invite.id);
        const res = await declineProjectInviteAction(invite.id);
        setProcessingId(null);

        if (res.success) {
          sileo.info(`Declined invitation to "${invite.projectName}".`, "Invitation Declined");
          setReceivedInvites((prev) => prev.filter((i) => i.id !== invite.id));
          onInviteHandled?.();
          router.refresh();
        } else {
          sileo.error(res.error || "Failed to decline invitation.", "Error");
        }
      },
    });
  };

  // Prompt confirmation for revoking a sent invite
  const handlePromptRevoke = (invite: UserSentInvite) => {
    setConfirmModal({
      isOpen: true,
      variant: "delete",
      title: `Revoke Invitation?`,
      description: `Revoke the invitation sent to ${invite.email} for "${invite.projectName}"? They will no longer be able to use it to join.`,
      confirmLabel: "Revoke",
      onConfirm: async () => {
        setProcessingId(invite.id);
        const res = await revokeSentInviteAction(invite.id);
        setProcessingId(null);

        if (res.success) {
          sileo.success(`Invitation to ${invite.email} has been revoked.`, "Invitation Revoked");
          setSentInvites((prev) =>
            prev.map((i) => (i.id === invite.id ? { ...i, status: "revoked" } : i)),
          );
          router.refresh();
        } else {
          sileo.error(res.error || "Failed to revoke invitation.", "Error");
        }
      },
    });
  };

  const filteredSentInvites = useMemo(() => {
    if (sentFilter === "all") return sentInvites;
    return sentInvites.filter((i) => i.status === sentFilter);
  }, [sentInvites, sentFilter]);

  const pendingReceivedCount = receivedInvites.length;
  const pendingSentCount = sentInvites.filter((i) => i.status === "pending").length;

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

  return (
    <div className="space-y-6">
      {/* Sub-tab Pill Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/60 self-start">
          <button
            type="button"
            onClick={() => setSubTab("received")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "received"
                ? "bg-white dark:bg-slate-900 text-[#0033a0] dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Inbox size={15} />
            <span>Received</span>
            {pendingReceivedCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-[#0033a0] text-white dark:bg-blue-500">
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab("sent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "sent"
                ? "bg-white dark:bg-slate-900 text-[#0033a0] dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Send size={15} />
            <span>Sent</span>
            {pendingSentCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500 text-white">
                {pendingSentCount}
              </span>
            )}
          </button>
        </div>

        {/* Sub-tab description or sent filters */}
        {subTab === "received" ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pending invitations sent to you to join projects and teams.
          </p>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              Filter:
            </span>
            {(
              [
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "accepted", label: "Accepted" },
                { key: "expired", label: "Expired" },
                { key: "revoked", label: "Declined/Revoked" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSentFilter(opt.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  sentFilter === opt.key
                    ? "bg-[#0033a0] text-white dark:bg-blue-600"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: RECEIVED INVITATIONS
      ───────────────────────────────────────────────────────────── */}
      {subTab === "received" && (
        <div className="space-y-4">
          {receivedInvites.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40 px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0033a0] dark:bg-blue-950/50 dark:text-blue-400">
                <MailCheck className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                No pending invitations
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                When a team lead or project owner invites you to collaborate, their invitation will
                appear here for you to accept or decline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivedInvites.map((invite) => {
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
                        onClick={() => handlePromptDecline(invite)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handlePromptAccept(invite)}
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
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: SENT INVITATIONS
      ───────────────────────────────────────────────────────────── */}
      {subTab === "sent" && (
        <div className="space-y-4">
          {filteredSentInvites.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40 px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Send className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {sentFilter === "all"
                  ? "No sent invitations"
                  : `No invitations with status "${sentFilter}"`}
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {sentFilter === "all"
                  ? "Invitations you send to new collaborators from your project teams will appear here with live delivery and acceptance status."
                  : "Try clearing or selecting a different filter above."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSentInvites.map((invite) => {
                const isProcessing = processingId === invite.id;
                const formattedDate = invite.createdAt
                  ? new Date(invite.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                const formattedAcceptedDate = invite.acceptedAt
                  ? new Date(invite.acceptedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={invite.id}
                    className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Header with Project & Status Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold flex-shrink-0">
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

                        {/* Status Badge */}
                        <div>
                          {invite.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                          {invite.status === "accepted" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" />
                              Accepted
                            </span>
                          )}
                          {invite.status === "expired" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              <AlertCircle className="w-3 h-3" />
                              Expired
                            </span>
                          )}
                          {invite.status === "revoked" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                              <XCircle className="w-3 h-3" />
                              Declined / Revoked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recipient & Role */}
                      <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {invite.recipientName || invite.email}
                            </span>
                            {invite.recipientName && (
                              <span className="block text-[11px] text-slate-400 truncate">
                                {invite.email}
                              </span>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0">
                            {formatRole(invite.role)}
                          </span>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>Sent on {formattedDate}</span>
                        </div>
                        {formattedAcceptedDate && (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Check className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Accepted on {formattedAcceptedDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pending Action: Revoke */}
                    {invite.status === "pending" && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handlePromptRevoke(invite)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          Revoke Invite
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await confirmModal.onConfirm();
        }}
        showCloseButton={false}
        variant={confirmModal.variant}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
      />
    </div>
  );
}
