export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  clerkId: string;
}

export interface CommentRecord {
  id: string;
  taskId: string;
  authorId: string;
  author: CommentAuthor | null;
  content: string;
  parentCommentId: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  replies: CommentRecord[];
}

export interface CommentThreadProps {
  taskId: string;
  taskTitle?: string;
  highlightedCommentId?: string | null;
}

export interface CommentItemProps {
  comment: CommentRecord;
  taskId: string;
  isReply?: boolean;
  highlightedCommentId?: string | null;
  onInitiateReply: (parentCommentId: string, authorName: string) => void;
  onUpdateComment: (commentId: string, newContent: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export interface CommentFormProps {
  taskId: string;
  replyingTo: { id: string; authorName: string } | null;
  onCancelReply: () => void;
  onSubmitComment: (content: string, parentCommentId?: string) => Promise<void>;
  isSubmitting?: boolean;
}
