"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { useUser } from "@clerk/nextjs";
import { Loader2, Reply, Send, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { CommentFormProps } from "./types";

export function CommentForm({
  replyingTo,
  onCancelReply,
  onSubmitComment,
  isSubmitting = false,
}: CommentFormProps) {
  const { user: clerkUser } = useUser();
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  const currentUserName =
    clerkUser?.fullName ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    "You";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    const parentId = replyingTo?.id;
    setContent("");
    await onSubmitComment(trimmed, parentId);
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#14263e] shrink-0">
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-sky-50 dark:bg-sky-950/40 text-[11px] text-sky-700 dark:text-sky-300 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 truncate">
            <Reply size={12} className="rotate-180 shrink-0 text-sky-600 dark:text-sky-400" />
            <span>
              Replying to <strong className="font-semibold">{replyingTo.authorName}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer transition-colors"
            title="Cancel reply"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2.5 px-4 py-3">
        <UserAvatar
          src={clerkUser?.imageUrl}
          name={currentUserName}
          size="sm"
          fallbackBg="bg-amber-400 text-amber-950 font-bold"
        />
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              replyingTo ? `Write a reply to ${replyingTo.authorName}…` : "Write a comment…"
            }
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d31] px-3 py-2 pr-9 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-[#00b4d8] disabled:opacity-60 transition-colors"
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00b4d8] disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
            title="Send comment"
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </div>
      </form>
    </div>
  );
}
