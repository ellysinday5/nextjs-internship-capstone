"use client";

import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useUser } from "@clerk/nextjs";
import { Check, Edit2, Reply, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import type { CommentItemProps } from "./types";

function formatCommentTime(date: Date | string | null | undefined): string {
  if (!date) return "Just now";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommentItem({
  comment,
  taskId,
  isReply = false,
  highlightedCommentId,
  onInitiateReply,
  onUpdateComment,
  onDeleteComment,
}: CommentItemProps) {
  const { user: clerkUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isDeleted = comment.content === "[deleted]";
  const isAuthor = clerkUser?.id === comment.authorId || clerkUser?.id === comment.author?.clerkId;
  const authorName = isDeleted ? "Deleted comment" : comment.author?.name || "Member";
  const isHighlighted = highlightedCommentId === comment.id;

  const isEdited =
    !isDeleted &&
    comment.updatedAt &&
    comment.createdAt &&
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 2000;

  function handleStartEdit() {
    setIsEditing(true);
    setEditText(comment.content);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditText(comment.content);
  }

  async function handleSaveEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === "[deleted]") return;
    setIsSaving(true);
    try {
      await onUpdateComment(comment.id, trimmed);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setShowDeleteModal(false);
    await onDeleteComment(comment.id);
  }

  return (
    <div
      id={`comment-${comment.id}`}
      className={`group rounded-xl p-2 -mx-2 transition-all duration-700 ${
        isHighlighted
          ? "bg-sky-100/70 dark:bg-sky-950/60 ring-2 ring-[#00b4d8] shadow-sm"
          : "hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <UserAvatar
          name={authorName}
          size={isReply ? "xs" : "sm"}
          fallbackBg={
            isReply
              ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold"
              : "bg-amber-400 text-amber-950 font-bold"
          }
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
              {authorName}
            </span>
            <span className="text-[10px] text-slate-400">{formatCommentTime(comment.createdAt)}</span>
            {isEdited && <span className="text-[10px] text-slate-400 italic">(edited)</span>}
          </div>

          {isDeleted ? (
            <p className="text-xs italic text-slate-400 dark:text-slate-500 mt-0.5">
              [This comment was deleted]
            </p>
          ) : isEditing ? (
            <div className="mt-1 space-y-1.5">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d31] px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-[#00b4d8]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="text-[10px] px-2 py-0.5 rounded text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editText.trim()}
                  className="text-[10px] px-2.5 py-0.5 rounded bg-[#0033a0] text-white font-medium hover:bg-[#002a80] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
              {comment.content}
            </p>
          )}

          {/* Action affordances */}
          {!isEditing && !isDeleted && (
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => onInitiateReply(comment.parentCommentId || comment.id, authorName)}
                className="hover:text-[#00b4d8] flex items-center gap-1 transition-colors cursor-pointer"
                title="Reply to comment"
              >
                <Reply size={11} className="rotate-180" /> Reply
              </button>
              {isAuthor && (
                <>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="hover:text-[#00b4d8] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Edit comment"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Delete comment"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Indented Threaded Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-2 mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              taskId={taskId}
              isReply={true}
              highlightedCommentId={highlightedCommentId}
              onInitiateReply={onInitiateReply}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        variant="delete"
        title="Delete comment?"
        description="Are you sure you want to delete this comment? If it has replies, its content will be marked as deleted."
        showCloseButton={false}
      />
    </div>
  );
}
