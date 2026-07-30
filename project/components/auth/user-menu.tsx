"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { LogOut, ChevronDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = () => {
    setDropdownOpen(false);
    setConfirmOpen(true);
  };

  const confirmSignOut = () => {
    signOut({ redirectUrl: "/sign-in" });
  };

  const initials = user?.firstName?.[0] || user?.username?.[0] || "U";
  const displayName = user?.fullName || user?.username || "User";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <>
      {/* Avatar + Dropdown trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl p-1 hover:bg-white/10 transition-colors"
          aria-label="User menu"
          suppressHydrationWarning
        >
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt="User avatar"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#3151b7] flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/30">
              {initials.toUpperCase()}
            </div>
          )}
          <ChevronDown
            size={14}
            className={`text-white/70 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#14263e] rounded-xl shadow-2xl border border-[#142843]/10 dark:border-white/10 overflow-hidden z-50 animate-slide-in-from-top">
            {/* User profile section */}
            <div className="px-4 py-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                {/* Profile picture */}
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="User avatar"
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 dark:ring-white/20 flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#3151b7] flex items-center justify-center text-white text-base font-bold ring-2 ring-slate-200 dark:ring-white/20 flex-shrink-0">
                    {initials.toUpperCase()}
                  </div>
                )}
                {/* Name and email */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#142843] dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5">
                    {displayEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout action */}
            <div className="p-2">
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sign-out confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription className="mt-1">
              Are you sure you want to sign out?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSignOut}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
