"use client";

import { Bell, Menu } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

export function Header({ onMenuClick, pageTitle = "Dashboard" }: HeaderProps) {
  return (
    <header className="bg-[#142843] w-full text-white sticky top-0 z-30 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Left section: SF | Page title */}
          <div className="flex items-center gap-4 sm:gap-8">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
                suppressHydrationWarning
              >
                <Menu size={22} />
              </button>
            )}

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-base sm:text-lg font-bold text-white tracking-wide">SF</span>
              <span className="text-white/40 font-light">|</span>
              <span className="text-base sm:text-lg font-semibold text-white/90 tracking-wide">
                {pageTitle}
              </span>
            </div>
          </div>

          {/* Right section: Notification Bell, Theme Toggle & User Button */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              aria-label="Notifications"
              className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors relative"
              suppressHydrationWarning
            >
              <Bell size={20} />
            </button>

            <ThemeToggle />

            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
