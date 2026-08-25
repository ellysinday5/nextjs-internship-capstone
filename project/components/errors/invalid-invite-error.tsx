"use client";

import { ErrorLayout } from "@/components/errors/error-layout";
import { InvalidInviteIllustration } from "@/components/errors/error-illustrations";

/* ─────────────────────────────────────────────────────────────────────────────
   InvalidInviteError — full-page error shown when an invite token lookup fails.
   Rendered by app/invite/[token]/not-found.tsx (triggered via notFound() in
   the server page component).

   This renders OUTSIDE the dashboard shell — only the root layout providers
   (ClerkProvider, ThemeProvider) wrap it. That's intentional: invite pages
   are accessed before the user is part of a project workspace.
───────────────────────────────────────────────────────────────────────────── */

export function InvalidInviteError() {
  return (
    <ErrorLayout
      illustration={<InvalidInviteIllustration className="w-36 h-36" />}
      code="Invalid Invite"
      title="This invitation isn't valid"
      description="The invite link you followed has expired, already been used, or doesn't exist. Please ask the project admin to send you a fresh invite."
      primaryAction={{ label: "Go to Home", href: "/" }}
      secondaryAction={{ label: "Sign in instead", href: "/sign-in" }}
    />
  );
}
