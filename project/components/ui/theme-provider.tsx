"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type FontSize = "small" | "medium" | "large";
export type DisplayDensity = "comfortable" | "cozy" | "compact";

export interface AppearanceState {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  density: DisplayDensity;
  setDensity: (density: DisplayDensity) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  compactSidebar: boolean;
  setCompactSidebar: (compact: boolean) => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean) => void;
  resetAppearance: () => void;
}

const initialState: AppearanceState = {
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => null,
  accentColor: "#0052cc",
  setAccentColor: () => null,
  fontSize: "medium",
  setFontSize: () => null,
  density: "comfortable",
  setDensity: () => null,
  animationsEnabled: true,
  setAnimationsEnabled: () => null,
  compactSidebar: false,
  setCompactSidebar: () => null,
  highContrast: false,
  setHighContrast: () => null,
  resetAppearance: () => null,
};

const ThemeProviderContext = createContext<AppearanceState>(initialState);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [accentColor, setAccentColorState] = useState<string>("#0052cc");
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");
  const [density, setDensityState] = useState<DisplayDensity>("comfortable");
  const [animationsEnabled, setAnimationsEnabledState] = useState<boolean>(true);
  const [compactSidebar, setCompactSidebarState] = useState<boolean>(false);
  const [highContrast, setHighContrastState] = useState<boolean>(false);

  // Hydrate from localStorage on initial client mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme && ["dark", "light", "system"].includes(savedTheme)) {
        setThemeState(savedTheme);
      }

      const savedAccent = localStorage.getItem("syntraflow_accent_color");
      if (savedAccent) setAccentColorState(savedAccent);

      const savedFontSize = localStorage.getItem("syntraflow_font_size") as FontSize;
      if (savedFontSize && ["small", "medium", "large"].includes(savedFontSize)) {
        setFontSizeState(savedFontSize);
      }

      const savedDensity = localStorage.getItem("syntraflow_density") as DisplayDensity;
      if (savedDensity && ["comfortable", "cozy", "compact"].includes(savedDensity)) {
        setDensityState(savedDensity);
      }

      const savedAnimations = localStorage.getItem("syntraflow_animations_enabled");
      if (savedAnimations !== null) setAnimationsEnabledState(savedAnimations === "true");

      const savedSidebar = localStorage.getItem("syntraflow_compact_sidebar");
      if (savedSidebar !== null) setCompactSidebarState(savedSidebar === "true");

      const savedContrast = localStorage.getItem("syntraflow_high_contrast");
      if (savedContrast !== null) setHighContrastState(savedContrast === "true");
    } catch {
      // ignore
    }
  }, []);

  // Apply Theme & Listen to OS changes when in system mode
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let active: "dark" | "light" = "light";
      if (theme === "system") {
        active = mediaQuery.matches ? "dark" : "light";
      } else {
        active = theme;
      }
      setResolvedTheme(active);
      root.classList.remove("light", "dark");
      root.classList.add(active);
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const listener = (e: MediaQueryListEvent) => {
        const active = e.matches ? "dark" : "light";
        setResolvedTheme(active);
        root.classList.remove("light", "dark");
        root.classList.add(active);
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [theme]);

  // Apply Accent Color
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty("--accent-color", accentColor);
    root.style.setProperty("--primary-color", accentColor);
    root.style.setProperty("--brand-color", accentColor);
    localStorage.setItem("syntraflow_accent_color", accentColor);
  }, [accentColor]);

  // Apply Font Size
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-font-size", fontSize);
    localStorage.setItem("syntraflow_font_size", fontSize);
  }, [fontSize]);

  // Apply Density
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-density", density);
    localStorage.setItem("syntraflow_density", density);
  }, [density]);

  // Apply Animations toggle
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("disable-animations", !animationsEnabled);
    localStorage.setItem("syntraflow_animations_enabled", String(animationsEnabled));
  }, [animationsEnabled]);

  // Apply Compact Sidebar
  useEffect(() => {
    localStorage.setItem("syntraflow_compact_sidebar", String(compactSidebar));
  }, [compactSidebar]);

  // Apply High Contrast
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("syntraflow_high_contrast", String(highContrast));
  }, [highContrast]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setAccentColor = (newColor: string) => setAccentColorState(newColor);
  const setFontSize = (newSize: FontSize) => setFontSizeState(newSize);
  const setDensity = (newDensity: DisplayDensity) => setDensityState(newDensity);
  const setAnimationsEnabled = (enabled: boolean) => setAnimationsEnabledState(enabled);
  const setCompactSidebar = (compact: boolean) => setCompactSidebarState(compact);
  const setHighContrast = (contrast: boolean) => setHighContrastState(contrast);

  const resetAppearance = () => {
    setThemeState("light");
    setAccentColorState("#0052cc");
    setFontSizeState("medium");
    setDensityState("comfortable");
    setAnimationsEnabledState(true);
    setCompactSidebarState(false);
    setHighContrastState(false);
  };

  const value: AppearanceState = {
    theme,
    resolvedTheme,
    setTheme,
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    density,
    setDensity,
    animationsEnabled,
    setAnimationsEnabled,
    compactSidebar,
    setCompactSidebar,
    highContrast,
    setHighContrast,
    resetAppearance,
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
