import { NewEventPageClient } from "@/components/calendar/new-event-page-client";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Event | SyntraFlow",
  description: "Schedule a new calendar event for your workspace.",
};

export default function NewEventPage() {
  return (
    <Suspense>
      <NewEventPageClient />
    </Suspense>
  );
}
