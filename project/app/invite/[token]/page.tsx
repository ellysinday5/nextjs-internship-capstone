import { InviteAcceptClient } from "@/app/invite/[token]/invite-accept-client";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import { invites, projects, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  // Retrieve current user (if logged in)
  const dbUser = await syncUser();

  // Retrieve invite from database
  const [invite] = await db.select().from(invites).where(eq(invites.token, token));

  // Invalid / expired token — triggers app/invite/[token]/not-found.tsx
  // which renders InvalidInviteError as a full-page experience (outside dashboard shell).
  if (!invite) notFound();

  // Fetch Project details
  const [project] = await db.select().from(projects).where(eq(projects.id, invite.projectId));

  // Fetch Inviter details
  const [inviter] = await db.select().from(users).where(eq(users.id, invite.invitedBy));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4f8] dark:bg-[#0b1728] p-4 font-sans">
      <InviteAcceptClient
        invite={invite}
        project={project}
        inviter={inviter}
        currentUser={dbUser}
        token={token}
      />
    </div>
  );
}
