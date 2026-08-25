import { getProjectBySlugAction } from "@/actions/project-actions";
import { ScopedTeamPageClient } from "@/components/team/scoped-team-page-client";
import { notFound } from "next/navigation";
import React from "react";

interface ScopedProjectTeamPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ScopedProjectTeamPage({ params }: ScopedProjectTeamPageProps) {
  const { projectSlug } = await params;
  const project = await getProjectBySlugAction(projectSlug);

  // Triggers app/(dashboard)/team/[projectSlug]/not-found.tsx
  // which renders ProjectNotFoundError inside the dashboard shell.
  if (!project) notFound();

  return <ScopedTeamPageClient project={project} />;
}

