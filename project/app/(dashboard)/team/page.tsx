import { getProjectsAction } from "@/actions/project-actions";
import { TeamPageClient } from "@/components/team/team-page-client";

export default async function TeamPage() {
  const projects = await getProjectsAction();
  const projectOptions = projects.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }));

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8">
      <TeamPageClient projectOptions={projectOptions} />
    </div>
  );
}