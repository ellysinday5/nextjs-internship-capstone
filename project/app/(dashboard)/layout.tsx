"use client";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useTheme } from "@/components/ui/theme-provider";
import { CategoryProvider } from "@/context/category-context";
import { ProjectTitleProvider, useProjectTitle } from "@/context/project-title-context";
import { BarChart2, Building2, Calendar, FolderOpen, Home, Settings, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Team", href: "/team", icon: Users },
  { name: "Workspaces", href: "/workspaces", icon: Building2 },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/projects/")) {
    const rawSlug = pathname.replace("/projects/", "");
    if (rawSlug) {
      const decoded = decodeURIComponent(rawSlug);
      const title = decoded
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return `Projects | ${title}`;
    }
  }
  const currentNav = navigation.find((n) => pathname.startsWith(n.href));
  return currentNav ? currentNav.name : "Dashboard";
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { compactSidebar } = useTheme();
  const [collapsed, setCollapsed] = useState(compactSidebar);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const pathname = usePathname();
  const { projectTitle } = useProjectTitle();

  useEffect(() => {
    setCollapsed(compactSidebar);
  }, [compactSidebar]);

  useEffect(() => {
    fetch("/api/auth/sync").catch((err) => {
      console.error("Auto sync failed:", err);
    });
  }, []);

  // Use live project title from context when on a project detail page
  const urlPageTitle = getPageTitle(pathname);
  const pageTitle =
    pathname.startsWith("/projects/") && projectTitle ? `Projects | ${projectTitle}` : urlPageTitle;

  return (
    <CategoryProvider>
      <div className="h-screen overflow-hidden bg-[#f0f4f8] dark:bg-[#0f1d31] flex font-sans">
        <DashboardSidebar
          mobileSidebarOpen={mobileSidebarOpen}
          onMobileSidebarClose={() => setMobileSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          onHoverChange={setSidebarHovered}
        />

        {/* Right side: Header + Content stacked vertically */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header
            onMenuClick={() => setMobileSidebarOpen(true)}
            pageTitle={pageTitle}
            sidebarCollapsed={collapsed}
            sidebarHovered={sidebarHovered}
          />

          <main className="flex-1 w-full min-w-0 overflow-hidden bg-[#f0f4f8] dark:bg-[#0b1728] flex flex-col">
            <Suspense>{children}</Suspense>
          </main>
        </div>
      </div>
    </CategoryProvider>
  );
}

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectTitleProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </ProjectTitleProvider>
  );
}
