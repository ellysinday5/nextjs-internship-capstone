"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  BarChart2,
  Calendar,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Team", href: "/team", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/sync").catch((err) => {
      console.error("Auto sync failed:", err);
    });
  }, []);

  // Capitalize current section title based on pathname
  const currentNav = navigation.find((n) => pathname.startsWith(n.href));
  const pageTitle = currentNav ? currentNav.name : "Dashboard";

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#0f1d31] flex font-sans">
      <DashboardSidebar
        mobileSidebarOpen={mobileSidebarOpen}
        onMobileSidebarClose={() => setMobileSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />

      {/* Right side: Header + Content stacked vertically */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} pageTitle={pageTitle} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f0f4f8] dark:bg-[#0b1728]">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}