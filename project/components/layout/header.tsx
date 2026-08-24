"use client";

import { UserMenu } from "@/components/auth/user-menu";
import { HeaderSearchModal } from "@/components/layout/header-search-modal";
<<<<<<< HEAD
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, Search } from "lucide-react";
=======
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Bell, Menu, Search } from "lucide-react";
>>>>>>> 4016eb6 (Fixed and Initial ui for the system)
import React, { useState } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string;
  sidebarCollapsed?: boolean;
  sidebarHovered?: boolean;
}

export function Header({ onMenuClick, pageTitle = "Dashboard" }: HeaderProps) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const titleSegments = pageTitle.split(" | ");

  return (
    <>
      <header className="bg-[#142843] w-full text-white z-30 shadow-md shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Left section: Hamburger (mobile) | Page title */}
            <div className="flex items-center gap-4 sm:gap-8">
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="lg:hidden p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Toggle menu"
                  suppressHydrationWarning
                >
                  <Menu size={22} />
                </button>
              )}

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">SF</span>
                <span className="text-white/40 font-light">|</span>
                {titleSegments.map((seg, idx) => (
                  <React.Fragment key={seg + idx}>
                    <span className="text-base sm:text-lg font-semibold text-white/90 tracking-wide">
                      {seg}
                    </span>
                    {idx < titleSegments.length - 1 && (
                      <span className="text-white/40 font-light">|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right section: Search, Bell, Theme, Divider, Profile */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Search pill */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 hover:shadow-[0_0_14px_3px_rgba(0,180,216,0.25)] text-white/80 hover:text-white transition-all duration-200 text-xs font-medium cursor-pointer min-w-[140px] sm:min-w-[200px]"
                aria-label="Open search filter"
                suppressHydrationWarning
              >
                <Search size={15} className="shrink-0" />
                <span className="hidden sm:inline flex-1 text-left">Search anything...</span>
                <span className="hidden sm:inline text-white/30 text-[10px] font-mono ml-auto">
                  ⌘K
                </span>
              </button>

              {/* Notification bell */}
              <NotificationBell />

              {/* Theme toggle — icon only, no box */}
              <ThemeToggle />

              {/* Vertical divider */}
              <span className="text-white/40 font-light select-none mx-0.5">|</span>

              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Search Filter Modal */}
      <HeaderSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
