"use client"

import { useEffect, useState, useCallback } from "react"
import { Mail, X, RotateCcw, Clock } from "lucide-react"
import {
  getPendingInvitesAction,
  cancelInviteAction,
  resendInviteAction,
  type PendingInvite,
} from "@/actions/invite-actions"
import { sileo } from "@/utils/alerts"

interface PendingInvitesListProps {
  projectId: string
  refreshKey: number 
}

export function PendingInvitesList({ projectId, refreshKey }: PendingInvitesListProps) {
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(false)
  const [actingOnId, setActingOnId] = useState<string | null>(null)

  const loadInvites = useCallback(async () => {
    if (!projectId) {
      setInvites([])
      return
    }
    setLoading(true)
    const rows = await getPendingInvitesAction(projectId)
    setInvites(rows)
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    loadInvites()
  }, [loadInvites, refreshKey])

  const handleCancel = async (inviteId: string) => {
    setActingOnId(inviteId)
    const result = await cancelInviteAction(inviteId, projectId)
    if (result.success) {
      setInvites((prev) => prev.filter((i) => i.id !== inviteId))
      sileo.success("Invite cancelled.", "Cancelled")
    } else {
      sileo.error(result.error ?? "Failed to cancel invite.", "Error")
    }
    setActingOnId(null)
  }

  const handleResend = async (inviteId: string) => {
    setActingOnId(inviteId)
    const result = await resendInviteAction(inviteId, projectId)
    if (result.success) {
      sileo.success("Invite resent.", "Sent")
      loadInvites()
    } else {
      sileo.error(result.error ?? "Failed to resend invite.", "Error")
    }
    setActingOnId(null)
  }

  if (!projectId) return null
  if (!loading && invites.length === 0) return null

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Clock size={13} />
        Pending Invites
      </h3>

      {loading ? (
        <p className="text-xs text-slate-400">Loading...</p>
      ) : (
        <ul className="space-y-2">
          {invites.map((invite) => (
            <li
              key={invite.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={13} className="shrink-0 text-slate-400" />
                <span className="truncate text-xs font-semibold text-[#142843] dark:text-slate-100">
                  {invite.email}
                </span>
                <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {invite.role}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={actingOnId === invite.id}
                  onClick={() => handleResend(invite.id)}
                  title="Resend invite"
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-[#142843] disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  type="button"
                  disabled={actingOnId === invite.id}
                  onClick={() => handleCancel(invite.id)}
                  title="Cancel invite"
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40"
                >
                  <X size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}