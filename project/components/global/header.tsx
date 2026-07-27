"use client"

import Link from "next/link"
import Image from "next/image"
import { Bell, Menu } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  onMenuClick?: () => void
  pageTitle?: string
}

export function Header({ onMenuClick, pageTitle = "Dashboard" }: HeaderProps) {
  return (
    <header className="bg-[#142843] w-full text-white sticky top-0 z-30 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Left section: Logo & Page title */}
          <div className="flex items-center gap-4 sm:gap-8">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={22} />
              </button>
            )}

            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/syntraflow-full-dark.svg"
                alt="SyntraFlow Logo"
                width={140}
                height={40}
                className="h-9 sm:h-10 w-auto"
                priority
              />
            </Link>

            <div className="hidden sm:block h-6 w-[1px] bg-white/20" />

            <span className="text-base sm:text-lg font-semibold text-white/90 tracking-wide">
              {pageTitle}
            </span>
          </div>

          {/* Right section: Notification Bell, Theme Toggle & User Button */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              aria-label="Notifications"
              className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors relative"
            >
              <Bell size={20} />
            </button>

            <ThemeToggle />

            <div className="flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 sm:w-10 sm:h-10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
