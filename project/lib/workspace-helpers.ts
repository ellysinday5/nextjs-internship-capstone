import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { cookies } from "next/headers";

/**
 * Resolves the canonical "active workspace ID" for the given user.
 *
 * Resolution order:
 *   1. The workspace stored in the `current_workspace_id` cookie — ONLY if the
 *      user actually owns or is an explicit member of that workspace (validation
 *      guard against stale/spoofed cookies).
 *   2. The user's earliest-created **owned** workspace (their personal default).
 *   3. The user's earliest-joined **member** workspace.
 *   4. `null` — the user has no workspaces at all.
 *
 * This is the single source of truth for "what is the active workspace" logic.
 * All workspace-scoped queries (getProjectsAction, getActiveWorkspaceMembersAction,
 * etc.) must call this helper instead of reading the cookie independently.
 */
export async function getActiveWorkspaceId(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieWsId = cookieStore.get("current_workspace_id")?.value;

  if (cookieWsId) {
    // Validate: user must OWN or be a MEMBER of the cookie workspace.
    const [owned] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(and(eq(workspaces.id, cookieWsId), eq(workspaces.ownerId, userId)));

    if (owned) return owned.id;

    const [membership] = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, cookieWsId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    if (membership) return membership.workspaceId;

    // Cookie is stale or belongs to a workspace this user no longer has access to.
    // Fall through to the deterministic default below.
  }

  // Default 1: earliest-created workspace that the user OWNS.
  const [firstOwned] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerId, userId))
    .orderBy(asc(workspaces.createdAt))
    .limit(1);

  if (firstOwned) return firstOwned.id;

  // Default 2: earliest workspace the user is a member of (non-owner).
  const [firstMembership] = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(asc(workspaceMembers.createdAt))
    .limit(1);

  return firstMembership?.workspaceId ?? null;
}
