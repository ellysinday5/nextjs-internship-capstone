"use client";

import {
  createCommentAction,
  deleteCommentAction,
  getCommentsForTaskAction,
  updateCommentAction,
} from "@/actions/comment-actions";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import type { CommentRecord, CommentThreadProps } from "./types";

export function CommentThread({ taskId, highlightedCommentId: propCommentId }: CommentThreadProps) {
  const { user: clerkUser } = useUser();
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string } | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(propCommentId || null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Load comments live from DB on mount and when taskId changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setReplyingTo(null);

    getCommentsForTaskAction(taskId)
      .then((res) => {
        if (isMounted && res.success) {
          setComments(res.comments);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  // Check URL hash / deep-link for comment highlighting
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    let targetId = propCommentId;

    if (!targetId && hash.startsWith("#comment-")) {
      targetId = hash.replace("#comment-", "");
    }

    if (targetId) {
      setActiveHighlightId(targetId);
      // Wait for comments to render into DOM then scroll
      const timer = setTimeout(() => {
        const el = document.getElementById(`comment-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);

      const fadeTimer = setTimeout(() => {
        setActiveHighlightId(null);
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(fadeTimer);
      };
    }
  }, [propCommentId, comments]);

  const totalCommentCount = useMemo(() => {
    function countRecursive(list: CommentRecord[]): number {
      return list.reduce((acc, c) => acc + 1 + countRecursive(c.replies || []), 0);
    }
    return countRecursive(comments);
  }, [comments]);

  // Handle Comment Submission (Optimistic + Live DB Action)
  async function handleSubmitComment(content: string, parentCommentId?: string) {
    if (isSubmitting) return;

    const tempId = `temp-${Date.now()}`;
    const currentUserName =
      clerkUser?.fullName ||
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
      clerkUser?.username ||
      "You";

    const optimisticRecord: CommentRecord = {
      id: tempId,
      taskId,
      authorId: clerkUser?.id || "",
      author: {
        id: clerkUser?.id || "",
        name: currentUserName,
        email: clerkUser?.primaryEmailAddress?.emailAddress || "",
        clerkId: clerkUser?.id || "",
      },
      content,
      parentCommentId: parentCommentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
    };

    // Optimistically update thread state
    if (parentCommentId) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentCommentId) {
            return { ...c, replies: [...c.replies, optimisticRecord] };
          }
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === parentCommentId
                ? { ...r, replies: [...(r.replies || []), optimisticRecord] }
                : r,
            ),
          };
        }),
      );
    } else {
      setComments((prev) => [...prev, optimisticRecord]);
    }

    setReplyingTo(null);
    setIsSubmitting(true);

    try {
      const res = await createCommentAction(taskId, content, parentCommentId);
      if (res.success && res.comment) {
        const confirmed = res.comment;
        if (parentCommentId) {
          setComments((prev) =>
            prev.map((c) => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: c.replies.map((r) => (r.id === tempId ? confirmed : r)),
                };
              }
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === parentCommentId
                    ? {
                        ...r,
                        replies: (r.replies || []).map((rr) => (rr.id === tempId ? confirmed : rr)),
                      }
                    : r,
                ),
              };
            }),
          );
        } else {
          setComments((prev) => prev.map((c) => (c.id === tempId ? confirmed : c)));
        }
      } else {
        const refetch = await getCommentsForTaskAction(taskId);
        if (refetch.success) setComments(refetch.comments);
      }
    } catch (err) {
      console.error("[CommentThread] Error creating comment:", err);
      const refetch = await getCommentsForTaskAction(taskId);
      if (refetch.success) setComments(refetch.comments);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Comment Update
  async function handleUpdateComment(commentId: string, newContent: string) {
    function updateRecursive(list: CommentRecord[]): CommentRecord[] {
      return list.map((c) => {
        if (c.id === commentId) {
          return { ...c, content: newContent, updatedAt: new Date() };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateRecursive(c.replies) };
        }
        return c;
      });
    }

    setComments((prev) => updateRecursive(prev));

    try {
      const res = await updateCommentAction(commentId, newContent);
      if (!res.success) {
        const refetch = await getCommentsForTaskAction(taskId);
        if (refetch.success) setComments(refetch.comments);
      }
    } catch (err) {
      console.error("[CommentThread] Error updating comment:", err);
      const refetch = await getCommentsForTaskAction(taskId);
      if (refetch.success) setComments(refetch.comments);
    }
  }

  // Handle Comment Delete
  async function handleDeleteComment(commentId: string) {
    function deleteRecursive(list: CommentRecord[]): CommentRecord[] {
      return list
        .map((c) => {
          if (c.id === commentId) {
            if (c.replies && c.replies.length > 0) {
              return { ...c, content: "[deleted]", updatedAt: new Date() };
            }
            return null;
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: deleteRecursive(c.replies) };
          }
          return c;
        })
        .filter(Boolean) as CommentRecord[];
    }

    setComments((prev) => deleteRecursive(prev));

    try {
      const res = await deleteCommentAction(commentId);
      if (!res.success) {
        const refetch = await getCommentsForTaskAction(taskId);
        if (refetch.success) setComments(refetch.comments);
      }
    } catch (err) {
      console.error("[CommentThread] Error deleting comment:", err);
      const refetch = await getCommentsForTaskAction(taskId);
      if (refetch.success) setComments(refetch.comments);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Comments Header & List */}
      <div ref={commentsContainerRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Comments {totalCommentCount > 0 && `(${totalCommentCount})`}
          </h4>
          {isLoading && <Loader2 size={13} className="animate-spin text-slate-400" />}
        </div>

        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                taskId={taskId}
                highlightedCommentId={activeHighlightId}
                onInitiateReply={(id, name) => setReplyingTo({ id, authorName: name })}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
        ) : isLoading ? (
          <div className="space-y-3 animate-pulse pt-1">
            {[1, 2].map((n) => (
              <div key={n} className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2.5 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
            No comments yet. Start the conversation!
          </p>
        )}
      </div>

      {/* Comment / Reply Form */}
      <div className="mt-4">
        <CommentForm
          taskId={taskId}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSubmitComment={handleSubmitComment}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
