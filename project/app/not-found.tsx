import { ErrorLayout } from "@/components/errors/error-layout";
import { NotFoundIllustration } from "@/components/errors/error-illustrations";

/* ─────────────────────────────────────────────────────────────────────────────
   app/not-found.tsx — Root-level 404 page.

   Triggered automatically by Next.js when:
   - A URL matches no route segment.
   - A server component or route handler calls notFound() from next/navigation.

   Renders OUTSIDE the dashboard shell (no sidebar/navbar).
───────────────────────────────────────────────────────────────────────────── */

export default function NotFound() {
  return (
    <ErrorLayout
      illustration={<NotFoundIllustration className="w-36 h-36" />}
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist, was moved, or the URL might have a typo. Double-check the address or head back to safety."
      primaryAction={{ label: "Back to Dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "Go to Home", href: "/" }}
    />
  );
}
