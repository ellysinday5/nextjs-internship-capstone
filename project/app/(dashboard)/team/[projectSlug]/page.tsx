import { getProjectBySlugAction } from "@/actions/project-actions";
import { ScopedTeamPageClient } from "@/components/team/scoped-team-page-client";
import { ArrowLeft, FolderKanban } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ScopedProjectTeamPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ScopedProjectTeamPage({ params }: ScopedProjectTeamPageProps) {
  const { projectSlug } = await params;
  const project = await getProjectBySlugAction(projectSlug);

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <FolderKanban className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Project Team Not Found</h1>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          The project team you are looking for does not exist or you do not have permission to view
          it.
        </p>
        <Link
          href="/team"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0033a0] text-white text-xs font-semibold hover:bg-[#00277a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Teams
        </Link>
      </div>
    );
  }

  return <ScopedTeamPageClient project={project} />;
}
