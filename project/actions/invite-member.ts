"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { syncUser } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function inviteTeamMember(
  projectId: string,
  email: string,
  role: string = "member"
) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return { success: false, error: "Project not found." };
    }

    const client = await clerkClient();

    try {
      await client.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
        publicMetadata: {
          projectId,
          role,
          invitedByUserId: user.id,
        },
        notify: true,
      });
    } catch (err: any) {
      console.error("[inviteTeamMember] Clerk invite failed:", err);

      if (err?.errors?.[0]?.code === "duplicate_record") {
        return { success: false, error: "An invite is already pending for this email." };
      }

      return { success: false, error: "Failed to send invite." };
    }

    revalidatePath(`/projects`);
    revalidatePath(`/team`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("[inviteTeamMember] Error:", error);
    return { success: false, error: "Failed to send invite. Please try again." };
  }
}