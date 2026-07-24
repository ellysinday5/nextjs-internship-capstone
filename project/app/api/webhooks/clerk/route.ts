import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, primary_email_address_id, first_name, last_name, username } =
        payload.data;

      const primaryEmail =
        email_addresses?.find((e: any) => e.id === primary_email_address_id)
          ?.email_address ||
        email_addresses?.[0]?.email_address ||
        "";

      const name =
        [first_name, last_name].filter(Boolean).join(" ") ||
        username ||
        primaryEmail.split("@")[0] ||
        "User";

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, id));

      if (existing.length > 0) {
        await db
          .update(users)
          .set({
            email: primaryEmail,
            name,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, id));
        console.log(`[Webhook] Updated user ${id}`);
      } else {
        await db.insert(users).values({
          clerkId: id,
          email: primaryEmail,
          name,
        });
        console.log(`[Webhook] Inserted new user ${id}`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
