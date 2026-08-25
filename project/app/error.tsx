"use client";

import { ErrorLayout } from "@/components/errors/error-layout";
import { RuntimeErrorIllustration } from "@/components/errors/error-illustrations";
import { useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   app/error.tsx — Root-level client-side runtime error boundary.

   Catches unhandled errors thrown during render in any page or layout below
   the root layout. Next.js wraps the subtree in a React error boundary and
   renders this component when that boundary catches an error.

   Important:
   - Must be a Client Component ("use client").
   - Receives `error` (the thrown value) and `reset` (retry callback).
   - We log the error to console.error so we don't lose debugging info while
     still showing a friendly UI to the user.
───────────────────────────────────────────────────────────────────────────── */

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the full error (including stack) for debugging — do not remove.
    console.error("[SyntraFlow] Unhandled runtime error:", error);
  }, [error]);

  return (
    <ErrorLayout
      illustration={<RuntimeErrorIllustration className="w-36 h-36" />}
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred on this page. Our team has been notified. You can try again or head back to the dashboard."
      primaryAction={{
        label: "Try again",
        onClick: reset,
      }}
      secondaryAction={{
        label: "Back to Dashboard",
        href: "/dashboard",
      }}
    />
  );
}
