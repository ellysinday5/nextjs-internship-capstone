"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const { isSignedIn } = useUser();

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-[#142843] w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - using the dark background variant from public folder */}
          <Link href="/" className="flex items-center">
            <Image
              src="/syntraflow-full-dark.svg"
              alt="SyntraFlow Logo"
              width={168}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="text-white/90 hover:text-white hover:bg-white/10"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white/90 hover:text-white text-sm sm:text-base font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <Link
                href="/sign-in"
                className="text-white/90 hover:text-white text-sm sm:text-base font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
