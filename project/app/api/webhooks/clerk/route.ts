import { db } from "@/lib/db";
<<<<<<< HEAD
import { projectMembers, projects, users, workspaceMembers } from "@/lib/db/schema";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
=======
import { users } from "@/lib/db/schema";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Webhook Error] Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Error: Missing webhook secret", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[Webhook Error] Signature verification failed:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const {
      id,
      email_addresses,
      primary_email_address_id,
      first_name,
      last_name,
      username,
      public_metadata,
    } = evt.data;

    const primaryEmail =
      email_addresses?.find((e: any) => e.id === primary_email_address_id)?.email_address ||
      email_addresses?.[0]?.email_address ||
      "";

    const name =
      [first_name, last_name].filter(Boolean).join(" ") ||
      username ||
      primaryEmail.split("@")[0] ||
      "User";

    const existing = await db.select().from(users).where(eq(users.clerkId, id));

    let internalUserId: string;

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          email: primaryEmail,
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));
      internalUserId = existing[0].id;
      console.log(`[Webhook] Updated user ${id} in database`);
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          clerkId: id,
          email: primaryEmail,
          name,
        })
        .returning({ id: users.id });
      internalUserId = inserted.id;
      console.log(`[Webhook] Inserted user ${id} into database`);
    }

    console.log("=== FULL EVENT PAYLOAD ===");
    console.log(JSON.stringify(evt, null, 2));

    if (eventType === "user.created") {
      const { projectId, role, workspaceId } = (public_metadata ?? {}) as {
        projectId?: string;
        role?: string;
        workspaceId?: string;
      };

      if (projectId) {
        try {
          await db.transaction(async (tx) => {
            // 1. Idempotent project membership insert
            const [existingMember] = await tx
              .select({ id: projectMembers.id })
              .from(projectMembers)
              .where(
                and(
                  eq(projectMembers.projectId, projectId),
                  eq(projectMembers.userId, internalUserId),
                ),
              );

            if (!existingMember) {
              await tx.insert(projectMembers).values({
                projectId,
                userId: internalUserId,
                name,
                role: role ?? "member",
              });
              console.log(
                `[Webhook] Added user ${internalUserId} to project ${projectId} via invite`,
              );
            }

            // 2. Idempotent workspace membership insert
            // Use workspaceId from metadata; fall back to looking it up from the project row
            let targetWorkspaceId = workspaceId;
            if (!targetWorkspaceId) {
              const [proj] = await tx
                .select({ workspaceId: projects.workspaceId })
                .from(projects)
                .where(eq(projects.id, projectId));
              targetWorkspaceId = proj?.workspaceId ?? undefined;
            }

            if (targetWorkspaceId) {
              const [existingWsMember] = await tx
                .select({ id: workspaceMembers.id })
                .from(workspaceMembers)
                .where(
                  and(
                    eq(workspaceMembers.workspaceId, targetWorkspaceId),
                    eq(workspaceMembers.userId, internalUserId),
                  ),
                );

              if (!existingWsMember) {
                await tx.insert(workspaceMembers).values({
                  workspaceId: targetWorkspaceId,
                  userId: internalUserId,
                  role: "member",
                });
                console.log(
                  `[Webhook] Added user ${internalUserId} to workspace ${targetWorkspaceId} as member`,
                );
              }
            }
          });
        } catch (err) {
          console.error(
            "[Webhook] Failed to insert projectMember/workspaceMember from invite:",
            err,
          );
        }
      }
    }
  } else if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await db.delete(users).where(eq(users.clerkId, id));
      console.log(`[Webhook] Deleted user ${id} from database`);
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
