import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

/**
 * Retrieves session auth data (userId, sessionId, orgId, etc.) in Server Components.
 */
export async function getAuthSession() {
  return await auth();
}

/**
 * Retrieves full Clerk user object in Server Components.
 */
export async function getClerkUser() {
  return await currentUser();
}

/**
 * Synchronizes the currently logged-in Clerk user with the Neon database.
 * If the user does not exist in the database, they will be inserted.
 * Returns the local database user object.
 */
export async function syncUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    "";

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    primaryEmail.split("@")[0] ||
    "User";

  try {
    // Check if user already exists in DB
    const existingUsers = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      // Optionally update name/email if changed
      if (existingUser.email !== primaryEmail || existingUser.name !== fullName) {
        const [updatedUser] = await db
          .update(users)
          .set({
            email: primaryEmail,
            name: fullName,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();
        return updatedUser;
      }
      return existingUser;
    }

    // User doesn't exist - create new user in Neon DB
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: primaryEmail,
        name: fullName,
      })
      .returning();

    console.log(`[syncUser] Synced new user to DB: ${newUser.id} (${newUser.email})`);
    return newUser;
  } catch (error) {
    console.error("[syncUser] Error syncing user to database:", error);
    throw error;
  }
}

/**
 * Permission check for workspace-level management (settings, invitations across all projects).
 * Only workspace owners and admins can manage the workspace.
 */
export function canManageWorkspace(workspaceRole?: string | null): boolean {
  if (!workspaceRole) return false;
  const role = workspaceRole.toLowerCase();
  return role === "owner" || role === "admin";
}

/**
 * Permission check for project-level member management.
 * Workspace owners have an implicit override to manage all projects in their workspace.
 * Otherwise, project managers / owners can manage their specific project.
 */
export function canManageProjectMembers(
  projectRole?: string | null,
  workspaceRole?: string | null,
): boolean {
  if (workspaceRole && workspaceRole.toLowerCase() === "owner") return true;
  if (!projectRole) return false;
  const pRole = projectRole.toLowerCase();
  return pRole === "owner" || pRole === "pm" || pRole === "project manager" || pRole === "admin";
}
