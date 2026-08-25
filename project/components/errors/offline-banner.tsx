"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   OfflineBanner — fixed bottom banner that appears when the browser loses
   internet connectivity. Mounted in the root layout (app/layout.tsx) so it
   is active across all pages: landing, auth, and dashboard alike.

   Uses the `online` / `offline` window events and navigator.onLine.
   Does NOT read navigator.onLine during server render — initialises as `true`
   (online) to avoid SSR hydration mismatches, then checks on mount.
───────────────────────────────────────────────────────────────────────────── */

export function OfflineBanner() {
  // Safe SSR default: assume online. Real value applied after mount.
  const [isOnline, setIsOnline] = useState(true);
  // Controls exit animation before unmounting
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Apply actual online status after mount (client-only)
    setIsOnline(navigator.onLine);
    setIsVisible(!navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
      // Brief "back online" flash, then hide
      setTimeout(() => setIsVisible(false), 2500);
    }

    function handleOffline() {
      setIsOnline(false);
      setIsVisible(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]
        flex items-center gap-3 px-5 py-3
        rounded-2xl border shadow-2xl
        text-sm font-medium
        transition-all duration-300
        ${
          isOnline
            ? "bg-emerald-600 border-emerald-500 text-white"
            : "bg-[#0a1628] border-[#0033a0]/60 text-white"
        }
      `}
    >
      {isOnline ? (
        <>
          {/* Back online */}
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>Back online</span>
        </>
      ) : (
        <>
          {/* Offline */}
          <WifiOff size={16} className="text-[#4d8fff] flex-shrink-0" />
          <span className="text-white/90">
            You&rsquo;re offline &mdash; some features may be unavailable
          </span>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
        </>
      )}
    </div>
  );
}
