"use client";

import { acceptInvite } from "@/actions/invite-actions";
import { sileo } from "@/utils/alerts";
import { SignInButton, SignOutButton, SignUpButton } from "@clerk/nextjs";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface InviteAcceptClientProps {
  invite: {
    id: string;
    email: string;
    projectId: string;
    invitedBy: string;
    token: string;
    status: "pending" | "accepted" | "expired" | "revoked";
    role: string;
    expiresAt: Date;
  };
  project?: {
    id: string;
    name: string;
    description: string | null;
  };
  inviter?: {
    id: string;
    name: string;
    email: string;
  };
  currentUser: {
    id: string;
    email: string;
    name: string;
  } | null;
  token: string;
}

export function InviteAcceptClient({
  invite,
  project,
  inviter,
  currentUser,
  token,
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAccept = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const result = await acceptInvite(token);
        if (result.success) {
          sileo.success("Successfully joined the project!", "Welcome");
          router.push(`/projects`);
        } else {
          setErrorMsg(result.error ?? "Failed to accept invitation.");
          sileo.error(result.error ?? "Failed to accept invitation.", "Error");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    });
  };

  // 1. Unauthenticated State
  if (!currentUser) {
    return (
      <div className="max-w-md w-full bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
          <LogIn size={24} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-[#142843] dark:text-white">
            Join {project?.name ?? "Project"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You've been invited to collaborate. Please sign in or register with your email address (
            <span className="font-semibold text-slate-700 dark:text-slate-200">{invite.email}</span>
            ) to accept the invite.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <SignInButton mode="modal">
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-[#142843] hover:bg-[#1c304a] text-white rounded-xl text-xs font-bold transition-all shadow-sm">
              <LogIn size={14} />
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all">
              <UserPlus size={14} />
              Create Account
            </button>
          </SignUpButton>
        </div>
      </div>
    );
  }

  // 2. Already Processed Invite
  if (invite.status !== "pending") {
    return (
      <div className="max-w-md w-full bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-[#142843] dark:text-white">
            Invite Link Status
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This invitation link is no longer active. It has already been{" "}
            <span className="font-bold">{invite.status}</span>.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#142843] hover:bg-[#1c304a] text-white rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <Home size={16} />
          Go to Dashboard
        </button>
      </div>
    );
  }

  // 3. Email Mismatch Warning
  const isEmailMismatch = currentUser.email.toLowerCase() !== invite.email.toLowerCase();
  if (isEmailMismatch) {
    return (
      <div className="max-w-md w-full bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-[#142843] dark:text-white">Email Mismatch</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400 space-y-3">
            <p>
              This invitation was sent to{" "}
              <span className="font-semibold text-rose-500">{invite.email}</span>.
            </p>
            <p>
              However, you are currently logged in as{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {currentUser.email}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <SignOutButton>
            <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#142843] hover:bg-[#1c304a] text-white rounded-xl text-sm font-bold transition-all shadow-sm">
              Sign Out of Account
            </button>
          </SignOutButton>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 4. Valid Pending Invite
  return (
    <div className="max-w-md w-full bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
      <div className="mx-auto w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
        <CheckCircle2 size={24} />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-extrabold tracking-widest text-violet-500 dark:text-violet-400 uppercase">
          Invitation Received
        </span>
        <h1 className="text-2xl font-black text-[#142843] dark:text-white leading-tight">
          Join {project?.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {inviter?.name ?? "A colleague"}
          </span>{" "}
          ({inviter?.email}) has invited you to collaborate as a project member.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 text-left font-medium">
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleAccept}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Accepting...
          </>
        ) : (
          <>
            <span>Accept Invitation</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}
