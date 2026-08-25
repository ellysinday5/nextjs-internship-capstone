import { describe, expect, it } from "vitest";
import {
  createCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from "@/lib/validations/comment";

describe("Comment Validation Schemas", () => {
  const validTaskId = "123e4567-e89b-12d3-a456-426614174000";
  const validParentId = "123e4567-e89b-12d3-a456-426614174001";
  const validCommentId = "123e4567-e89b-12d3-a456-426614174002";

  it("validates correct create comment payload", () => {
    const res = createCommentSchema.safeParse({
      taskId: validTaskId,
      content: "This is a test comment",
    });
    expect(res.success).toBe(true);
  });

  it("validates correct reply comment payload", () => {
    const res = createCommentSchema.safeParse({
      taskId: validTaskId,
      content: "This is a reply comment",
      parentCommentId: validParentId,
    });
    expect(res.success).toBe(true);
  });

  it("rejects empty content", () => {
    const res = createCommentSchema.safeParse({
      taskId: validTaskId,
      content: "",
    });
    expect(res.success).toBe(false);
  });

  it("rejects invalid UUIDs", () => {
    const res = createCommentSchema.safeParse({
      taskId: "invalid-uuid",
      content: "Test content",
    });
    expect(res.success).toBe(false);
  });

  it("validates update comment schema", () => {
    const res = updateCommentSchema.safeParse({
      id: validCommentId,
      content: "Updated text",
    });
    expect(res.success).toBe(true);
  });

  it("validates delete comment schema", () => {
    const res = deleteCommentSchema.safeParse({
      id: validCommentId,
    });
    expect(res.success).toBe(true);
  });
});

describe("Comment Tree Nesting Logic", () => {
  interface FlatComment {
    id: string;
    taskId: string;
    content: string;
    parentCommentId: string | null;
    createdAt: Date;
  }

  interface NestedComment extends FlatComment {
    replies: NestedComment[];
  }

  function buildCommentTree(flat: FlatComment[]): NestedComment[] {
    const map = new Map<string, NestedComment>();
    const roots: NestedComment[] = [];

    for (const item of flat) {
      map.set(item.id, { ...item, replies: [] });
    }

    for (const item of map.values()) {
      if (!item.parentCommentId) {
        roots.push(item);
      } else {
        const parent = map.get(item.parentCommentId);
        if (parent) {
          parent.replies.push(item);
        } else {
          roots.push(item);
        }
      }
    }

    return roots;
  }

  it("correctly nests replies under parent comments", () => {
    const flat: FlatComment[] = [
      {
        id: "c1",
        taskId: "t1",
        content: "Top level 1",
        parentCommentId: null,
        createdAt: new Date("2026-01-01T10:00:00Z"),
      },
      {
        id: "c2",
        taskId: "t1",
        content: "Reply to top level 1",
        parentCommentId: "c1",
        createdAt: new Date("2026-01-01T10:05:00Z"),
      },
      {
        id: "c3",
        taskId: "t1",
        content: "Top level 2",
        parentCommentId: null,
        createdAt: new Date("2026-01-01T10:10:00Z"),
      },
    ];

    const tree = buildCommentTree(flat);
    expect(tree).toHaveLength(2);
    expect(tree[0].id).toBe("c1");
    expect(tree[0].replies).toHaveLength(1);
    expect(tree[0].replies[0].id).toBe("c2");
    expect(tree[1].id).toBe("c3");
    expect(tree[1].replies).toHaveLength(0);
  });
});
