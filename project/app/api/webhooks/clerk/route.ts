import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, projectMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
      const { projectId, role } = (public_metadata ?? {}) as {
        projectId?: string;
        role?: string;
      };

      if (projectId) {
        try {
          const [existingMember] = await db
            .select()
            .from(projectMembers)
            .where(
              and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.userId, internalUserId)
              )
            );

          if (!existingMember) {
            await db.insert(projectMembers).values({
              projectId,
              userId: internalUserId,
              name,
              role: role ?? "member",
            });
            console.log(
              `[Webhook] Added user ${internalUserId} to project ${projectId} via invite`
            );
          }
        } catch (err) {
          console.error("[Webhook] Failed to insert projectMember from invite:", err);
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