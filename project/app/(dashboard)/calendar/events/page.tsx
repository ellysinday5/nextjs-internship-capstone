import { ManageEventsPageClient } from "@/components/calendar/manage-events-page-client";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Manage Events | SyntraFlow",
  description: "View, edit, and manage your calendar events.",
};

export default function ManageEventsPage() {
  return (
    <Suspense>
      <ManageEventsPageClient />
    </Suspense>
  );
}
