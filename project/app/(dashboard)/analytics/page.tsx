import { AnalyticsPageClient } from "@/components/analytics/analytics-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | SyntraFlow",
  description: "Track project performance, completion metrics, and team productivity in real time.",
};

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
