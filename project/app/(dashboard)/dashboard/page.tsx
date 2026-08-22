import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SyntraFlow",
  description: "Your workspace overview and team activity.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
