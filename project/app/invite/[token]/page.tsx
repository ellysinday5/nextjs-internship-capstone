import { InviteAcceptClient } from "@/app/invite/[token]/invite-accept-client";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/db/auth";
import { invites, projects, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Home } from "lucide-react";
import Link from "next/link";

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

  if (!invite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-red-500 mb-2">Invalid Invite</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            This invitation link is invalid or has been deleted. Please check the URL or request a
            new invite.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            <Home size={16} />
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }

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
