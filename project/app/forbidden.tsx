import { ErrorLayout } from "@/components/errors/error-layout";
import { ForbiddenIllustration } from "@/components/errors/error-illustrations";

/* ─────────────────────────────────────────────────────────────────────────────
   app/forbidden.tsx — 403 Access Forbidden page.

   Shown when a user attempts to access a project or workspace resource they
   don't have permission for (e.g. canManageMembers / canManageWorkspace
   returned false and the calling code redirects here).

   Renders OUTSIDE the dashboard shell — full-page branded experience.
───────────────────────────────────────────────────────────────────────────── */

export default function ForbiddenPage() {
  return (
    <ErrorLayout
      illustration={<ForbiddenIllustration className="w-36 h-36" />}
      code="403"
      title="Access denied"
      description="You don't have permission to view this project or workspace. If you think this is a mistake, ask an admin to adjust your role or re-invite you."
      primaryAction={{ label: "Back to Dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "View your projects", href: "/projects" }}
    />
  );
}
