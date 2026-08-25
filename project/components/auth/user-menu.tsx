"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useUserProfile } from "@/context/user-profile-context";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { profile } = useUserProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const displayName = user?.fullName || profile.fullName || user?.username || "User";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || profile.email || "";
  const avatarSrc = profile.avatarUrl || user?.imageUrl;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full p-0.5 hover:bg-white/10 transition-all duration-200 cursor-pointer"
          aria-label="User menu"
          suppressHydrationWarning
        >
          <UserAvatar
            src={avatarSrc}
            name={displayName}
            size="md"
            className="ring-2 ring-purple-400/40 shadow-sm"
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2.5 w-64 bg-white dark:bg-[#14263e] rounded-2xl shadow-2xl border border-[#142843]/10 dark:border-white/10 overflow-hidden z-50 animate-slide-in-from-top">
            <div className="px-4 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={avatarSrc}
                  name={displayName}
                  size="base"
                  className="ring-2 ring-purple-400/30 shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#142843] dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {displayEmail}
                  </p>
                </div>
              </div>
            </div>

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
