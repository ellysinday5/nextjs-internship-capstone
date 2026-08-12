"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { projectMembers, projects } from "@/lib/db/schema";
import { syncUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ProjectMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  createdAt: Date | null;
}

/* ─────────────────────────────────────────────────────────────
   Get all members of a project
───────────────────────────────────────────────────────────── */
export async function getProjectMembersAction(
  projectId: string
): Promise<ProjectMember[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const rows = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));

    return rows;
  } catch (error) {
    console.error("[getProjectMembersAction] Error:", error);
    return [];
  }
}

/* ─────────────────────────────────────────────────────────────
   Add a member to a project
───────────────────────────────────────────────────────────── */
export async function addProjectMemberAction(
  projectId: string,
  data: { name: string; role: string }
) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    // Verify the current user owns this project
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)));

    if (!project) {
      return { success: false, error: "Project not found or access denied." };
    }

    if (!data.name.trim()) {
      return { success: false, error: "Member name is required." };
    }

    if (!data.role.trim()) {
      return { success: false, error: "Member role is required." };
    }

    const [newMember] = await db
      .insert(projectMembers)
      .values({
        projectId,
        name: data.name.trim(),
        role: data.role,
      })
      .returning();

    revalidatePath(`/projects`);

    return { success: true, member: newMember };
  } catch (error) {
    console.error("[addProjectMemberAction] Error:", error);
    return { success: false, error: "Failed to add member. Please try again." };
  }
}

/* ─────────────────────────────────────────────────────────────
   Remove a member from a project
───────────────────────────────────────────────────────────── */
export async function removeProjectMemberAction(
  memberId: string,
  projectId: string
) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    // Verify the current user owns this project
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)));

    if (!project) {
      return { success: false, error: "Project not found or access denied." };
    }

    await db
      .delete(projectMembers)
      .where(eq(projectMembers.id, memberId));

    revalidatePath(`/projects`);

    return { success: true };
  } catch (error) {
    console.error("[removeProjectMemberAction] Error:", error);
    return {
      success: false,
      error: "Failed to remove member. Please try again.",
    };
  }
}
