import { getUserWorkspacesAction } from "@/actions/member-actions";
import { WorkspacesPageClient } from "@/components/workspaces/workspaces-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Workspaces | SyntraFlow",
  description: "View and manage your owned and member workspaces.",
};

export default async function WorkspacesPage() {
  const initialData = await getUserWorkspacesAction();

  return <WorkspacesPageClient initialData={initialData} />;
}
