"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Header } from "@/components/global/header"
import { Home, FolderOpen, Users, Settings, X, BarChart2, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Team", href: "/team", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/auth/sync").catch((err) => {
      console.error("Auto sync failed:", err)
    })
  }, [])

  const sidebarWidth = collapsed ? "w-[72px]" : "w-64"

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#0f1d31] flex flex-col font-sans">
      {/* Top Header */}
      <Header onMenuClick={() => setMobileSidebarOpen(true)} pageTitle="Dashboard" />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#142843] text-white flex flex-col border-r border-white/10 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <span className="font-bold text-lg tracking-wide">Menu</span>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${isActive
                      ? "bg-[#3151b7] text-white shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Desktop Sidebar (collapsible) */}
        <aside
          className={`hidden lg:flex flex-col bg-[#142843] text-white border-r border-white/10 shadow-lg transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarWidth}`}
        >
          {/* Collapse toggle */}
          <div className={`flex items-center h-14 border-b border-white/10 px-3 ${collapsed ? "justify-center" : "justify-end"}`}>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3.5 px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-150 group ${collapsed ? "justify-center" : ""
                    } ${isActive
                      ? "bg-[#3151b7] text-white shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f0f4f8] dark:bg-[#0b1728]">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
