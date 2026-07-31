"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  X,
  BarChart2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Team", href: "/team", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface DashboardSidebarProps {
  mobileSidebarOpen: boolean;
  onMobileSidebarClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function DashboardSidebar({
  mobileSidebarOpen,
  onMobileSidebarClose,
  collapsed,
  onToggleCollapsed,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const sidebarWidth = collapsed ? "w-[72px]" : "w-64";

  return (
    <>
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onMobileSidebarClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#142843] text-white flex flex-col border-r border-white/10 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative flex items-center justify-center h-20 px-5 bg-[#142843] border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/syntraflow-full-dark.svg"
              alt="SyntraFlow Logo"
              width={190}
              height={52}
              className="h-12 w-auto"
            />
          </Link>
          <button
            onClick={onMobileSidebarClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            suppressHydrationWarning
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileSidebarClose}
                className={`flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-[#3151b7] text-white shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Sidebar (collapsible) - full height */}
      <aside
        className={`hidden lg:flex flex-col bg-[#142843] text-white border-r border-white/10 shadow-lg transition-all duration-300 ease-in-out flex-shrink-0 relative ${sidebarWidth}`}
      >
        <div className="relative flex items-center justify-center h-20 bg-[#142843] border-b border-white/10 px-3">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            {collapsed ? (
              <Image
                src="/syntraflow-icon.svg"
                alt="SyntraFlow"
                width={42}
                height={42}
                className="h-10 w-10"
              />
            ) : (
              <Image
                src="/syntraflow-full-dark.svg"
                alt="SyntraFlow Logo"
                width={190}
                height={52}
                className="h-12 w-auto"
              />
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={onToggleCollapsed}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Collapse sidebar"
              suppressHydrationWarning
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {collapsed && (
            <button
              onClick={onToggleCollapsed}
              className="absolute -right-3 top-7 bg-[#142843] border border-white/10 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors shadow-md z-10"
              aria-label="Expand sidebar"
              suppressHydrationWarning
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3.5 px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-150 group ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-[#3151b7] text-white shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon
                  size={20}
                  className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}