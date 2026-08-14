"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { invites, projects, projectMembers, users } from "@/lib/db/schema";
import { syncUser } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/mailer";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const INVITE_EXPIRY_DAYS = 7;


export async function inviteTeamMember(projectId: string, email: string, role: string = "member") {
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

    const [existingInvite] = await db
      .select()
      .from(invites)
      .where(
        and(
          eq(invites.projectId, projectId),
          eq(invites.email, email),
          eq(invites.status, "pending")
        )
      );

    if (existingInvite) {
      return { success: false, error: "An invite is already pending for this email." };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    await db.insert(invites).values({
      email,
      projectId,
      invitedBy: user.id,
      token,
      status: "pending",
      role,
      expiresAt,
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    try {
      await sendInviteEmail(email, inviteLink, project.name);
    } catch (err) {
      console.error("[inviteTeamMember] Email send failed:", err);
      return { success: false, error: "Invite created but email failed to send." };
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


export async function acceptInvite(token: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.token, token));

    if (!invite) {
      return { success: false, error: "Invite not found." };
    }
    if (invite.status !== "pending") {
      return { success: false, error: `Invite already ${invite.status}.` };
    }
    if (invite.expiresAt < new Date()) {
      await db.update(invites).set({ status: "expired" }).where(eq(invites.id, invite.id));
      return { success: false, error: "Invite has expired." };
    }
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return { success: false, error: "This invite was sent to a different email address." };
    }

    const [existingMember] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, invite.projectId),
          eq(projectMembers.userId, user.id)
        )
      );

    if (!existingMember) {
      await db.insert(projectMembers).values({
        projectId: invite.projectId,
        userId: user.id,
        name: user.name,
        role: invite.role,
      });
    }

    await db
      .update(invites)
      .set({ status: "accepted", acceptedAt: new Date() })
      .where(eq(invites.id, invite.id));

    revalidatePath(`/projects`);
    revalidatePath(`/team`);
    revalidatePath(`/dashboard`);

    return { success: true, projectId: invite.projectId };
  } catch (error) {
    console.error("[acceptInvite] Error:", error);
    return { success: false, error: "Failed to accept invite. Please try again." };
  }
}


export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date | null;
  expiresAt: Date;
}

export async function getPendingInvitesAction(
  projectId: string
): Promise<PendingInvite[]> {
  try {
    const user = await syncUser();
    if (!user) return [];

    const rows = await db
      .select()
      .from(invites)
      .where(
        and(eq(invites.projectId, projectId), eq(invites.status, "pending"))
      );

    return rows;
  } catch (error) {
    console.error("[getPendingInvitesAction] Error:", error);
    return [];
  }
}


export async function cancelInviteAction(inviteId: string, projectId: string) {
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
      .update(invites)
      .set({ status: "revoked" })
      .where(eq(invites.id, inviteId));

    revalidatePath(`/team`);

    return { success: true };
  } catch (error) {
    console.error("[cancelInviteAction] Error:", error);
    return { success: false, error: "Failed to cancel invite." };
  }
}

export async function resendInviteAction(inviteId: string, projectId: string) {
  try {
    const user = await syncUser();
    if (!user) return { success: false, error: "Unauthorized. Please sign in." };

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)));

    if (!project) {
      return { success: false, error: "Project not found or access denied." };
    }

    const [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.id, inviteId));

    if (!invite) {
      return { success: false, error: "Invite not found." };
    }

    const newToken = crypto.randomUUID();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + INVITE_EXPIRY_DAYS);

    await db
      .update(invites)
      .set({ token: newToken, expiresAt: newExpiresAt, status: "pending" })
      .where(eq(invites.id, inviteId));

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${newToken}`;

    try {
      await sendInviteEmail(invite.email, inviteLink, project.name);
    } catch (err) {
      console.error("[resendInviteAction] Email send failed:", err);
      return { success: false, error: "Invite updated but email failed to send." };
    }

    revalidatePath(`/team`);

    return { success: true };
  } catch (error) {
    console.error("[resendInviteAction] Error:", error);
    return { success: false, error: "Failed to resend invite." };
  }
}