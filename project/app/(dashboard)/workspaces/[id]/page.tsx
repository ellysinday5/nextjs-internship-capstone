import {
  type WorkspaceOverview,
  getWorkspaceOverviewAction,
} from "@/actions/member-actions";
import { WorkspaceOverviewClient } from "@/components/workspaces/workspace-overview-client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const overview = await getWorkspaceOverviewAction(id);
  if (!overview) return { title: "Workspace | SyntraFlow" };
  return {
    title: `${overview.name} | SyntraFlow`,
    description: `Overview of the ${overview.name} workspace — members, projects, and activity.`,
  };
}

export default async function WorkspaceOverviewPage({ params }: Props) {
  const { id } = await params;
  const overview: WorkspaceOverview | null = await getWorkspaceOverviewAction(id);

  if (!overview) {
    notFound();
  }

  return <WorkspaceOverviewClient overview={overview} />;
}
