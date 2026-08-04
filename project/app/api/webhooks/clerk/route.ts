import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Webhook Error] Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Error: Missing webhook secret", { status: 500 });
  }

  // Retrieve svix headers for signature verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Get raw body as text for verification
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
    const { id, email_addresses, primary_email_address_id, first_name, last_name, username } =
      evt.data;

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

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          email: primaryEmail,
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));
      console.log(`[Webhook] Updated user ${id} in database`);
    } else {
      await db.insert(users).values({
        clerkId: id,
        email: primaryEmail,
        name,
      });
      console.log(`[Webhook] Inserted user ${id} into database`);
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
