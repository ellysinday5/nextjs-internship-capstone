"use client";

import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="bg-[#142843] w-full text-white z-30 shadow-md shrink-0 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
          >
            <Image
              src="/syntraflow-full-dark.svg"
              alt="SyntraFlow Logo"
              width={168}
              height={48}
              className="h-10 sm:h-12 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                <ThemeToggle />
                <span className="text-white/30 font-light select-none">|</span>
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-white/90 hover:text-white text-xs sm:text-sm font-semibold transition-colors px-3.5 py-2 rounded-xl hover:bg-white/10"
                >
                  Sign In
                </Link>
                <ThemeToggle />
                <span className="text-white/30 font-light select-none">|</span>
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs sm:text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
