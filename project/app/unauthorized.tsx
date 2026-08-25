import { ErrorLayout } from "@/components/errors/error-layout";
import { ForbiddenIllustration } from "@/components/errors/error-illustrations";

/* ─────────────────────────────────────────────────────────────────────────────
   app/unauthorized.tsx — 401 Unauthenticated page.

   Shown when an unauthenticated user tries to access a protected resource.
   Middleware or server components can redirect here when Clerk's auth()
   returns no session.

   Renders OUTSIDE the dashboard shell — full-page branded experience.
───────────────────────────────────────────────────────────────────────────── */

export default function UnauthorizedPage() {
  return (
    <ErrorLayout
      illustration={<ForbiddenIllustration className="w-36 h-36" />}
      code="401"
      title="You need to sign in"
      description="This page is only accessible to signed-in users. Please sign in to your SyntraFlow account to continue."
      primaryAction={{ label: "Sign in", href: "/sign-in" }}
      secondaryAction={{ label: "Go to Home", href: "/" }}
    />
  );
}
