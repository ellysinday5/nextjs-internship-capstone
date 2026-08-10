"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/15 hover:shadow-[0_0_12px_2px_rgba(255,255,255,0.12)] transition-all duration-200"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {!mounted ? <Sun size={20} /> : theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
