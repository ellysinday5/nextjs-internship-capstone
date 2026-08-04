"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Footer } from "@/components/layout/footer";
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

import { UserProfileProvider } from "@/context/user-profile-context";
import { CategoryProvider } from "@/context/category-context";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/sync").catch((err) => {
      console.error("Auto sync failed:", err);
    });
  }, []);

  const pageTitle = getPageTitle(pathname);

  return (
    <UserProfileProvider>
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

            <main className="flex-1 overflow-y-auto bg-[#f0f4f8] dark:bg-[#0b1728] flex flex-col justify-between">
              <div className="p-4 sm:p-6 lg:p-8 flex-1">
                <Suspense>{children}</Suspense>
              </div>
              <Footer />
            </main>
          </div>
        </div>
      </CategoryProvider>
    </UserProfileProvider>
  );
}