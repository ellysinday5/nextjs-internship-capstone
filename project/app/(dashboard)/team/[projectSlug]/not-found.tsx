import { ProjectNotFoundError } from "@/components/errors/project-not-found-error";

/* ─────────────────────────────────────────────────────────────────────────────
   app/(dashboard)/team/[projectSlug]/not-found.tsx

   Triggered when the server page component calls notFound() from next/navigation
   after getProjectBySlugAction() returns null for an invalid project slug.

   Because this not-found.tsx is nested inside the (dashboard) route group,
   Next.js automatically renders the dashboard layout (sidebar + navbar) around
   it — no manual shell threading required.
───────────────────────────────────────────────────────────────────────────── */

export default function TeamProjectNotFound() {
  return (
    <ProjectNotFoundError
      heading="Project team not found"
      description="This project doesn't exist or you don't have access to it. If you were added recently, try refreshing or ask the project admin to resend the invite."
      backHref="/team"
      backLabel="Back to All Teams"
    />
  );
}
