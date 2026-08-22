"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  /** Where to go. If omitted, calls router.back() */
  href?: string;
  onClick?: () => void;
  title?: string;
  className?: string;
}

/**
 * Consistent circular back-button used across all pages.
 * Renders a bordered circle with a chevron-left icon.
 */
export function BackButton({ href, onClick, title = "Go back", className = "" }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
      aria-label={title}
    >
      <ChevronLeft size={16} strokeWidth={2.5} />
    </button>
  );
}
