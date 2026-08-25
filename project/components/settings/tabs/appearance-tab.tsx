"use client";

import {
  type FontSize,
  type Theme,
  useTheme,
} from "@/components/ui/theme-provider";
import { sileo } from "@/utils/alerts";
import {
  CheckCircle2,
  Monitor,
  Moon,
  Shield,
  Sun,
  Type,
  Zap,
} from "lucide-react";
import React from "react";

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:ring-offset-2 ${
        checked ? "bg-[#0052cc]" : "bg-slate-300 dark:bg-slate-600"
      }`}
      suppressHydrationWarning
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function AppearanceTab() {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    animationsEnabled,
    setAnimationsEnabled,
    compactSidebar,
    setCompactSidebar,
    highContrast,
    setHighContrast,
    resetAppearance,
  } = useTheme();

  return (
    <div className="p-6 sm:p-8 space-y-7">
      <div>
        <h2 className="text-lg font-bold text-[#142843] dark:text-white">Appearance Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize the look and feel of your workspace. Changes apply live across the entire
          system.
        </p>
        <div className="border-b border-slate-100 dark:border-slate-800 mt-4" />
      </div>

      {/* Theme Mode */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sun size={14} className="text-slate-400" />
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Theme
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { mode: "light" as Theme, label: "Light", Icon: Sun },
            { mode: "dark" as Theme, label: "Dark", Icon: Moon },
            { mode: "system" as Theme, label: "System", Icon: Monitor },
          ].map(({ mode, label, Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setTheme(mode);
                sileo.success(`Switched to ${label} theme.`, "Theme Updated");
              }}
              className={`relative flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl border-2 font-semibold text-sm transition-all cursor-pointer ${
                theme === mode
                  ? "border-[#0052cc] bg-[#0052cc]/8 dark:bg-[#0052cc]/20 text-[#0052cc] dark:text-sky-400 shadow-sm"
                  : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
              }`}
            >
              {theme === mode && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-[#0052cc] rounded-full flex items-center justify-center">
                  <CheckCircle2 size={10} className="text-white" />
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === mode
                    ? "bg-[#0052cc]/10 dark:bg-[#0052cc]/20"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="text-xs font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type size={14} className="text-slate-400" />
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Font Size
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["small", "medium", "large"] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setFontSize(size);
                sileo.success(`Font size changed to ${size}.`, "Font Updated");
              }}
              className={`py-3 rounded-xl border-2 font-semibold transition-all text-center cursor-pointer ${
                fontSize === size
                  ? "border-[#0052cc] bg-[#0052cc]/8 text-[#0052cc] dark:text-sky-400"
                  : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`font-bold ${
                  size === "small" ? "text-xs" : size === "medium" ? "text-sm" : "text-base"
                }`}
              >
                Aa
              </span>
              <p className="text-[10px] mt-0.5 capitalize">{size}</p>
            </button>
          ))}
        </div>
      </div>

      {/* System Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Zap size={13} className="text-slate-500" />
            </div>
            <div>
              <h4 className="font-semibold text-[#142843] dark:text-white text-sm">Animations</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enable transitions and motion effects across pages
              </p>
            </div>
          </div>
          <ToggleSwitch checked={animationsEnabled} onChange={setAnimationsEnabled} />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Monitor size={13} className="text-slate-500" />
            </div>
            <div>
              <h4 className="font-semibold text-[#142843] dark:text-white text-sm">
                Compact Sidebar
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Collapse sidebar to icon-only mode to maximize workspace
              </p>
            </div>
          </div>
          <ToggleSwitch checked={compactSidebar} onChange={setCompactSidebar} />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Shield size={13} className="text-slate-500" />
            </div>
            <div>
              <h4 className="font-semibold text-[#142843] dark:text-white text-sm">
                High Contrast
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enhance contrast for sharper visibility
              </p>
            </div>
          </div>
          <ToggleSwitch checked={highContrast} onChange={setHighContrast} />
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex items-center justify-between">
        <span className="text-xs text-slate-400">All appearance changes apply immediately.</span>
        <button
          type="button"
          onClick={() => {
            resetAppearance();
            sileo.info("Restored appearance defaults.", "Defaults Restored");
          }}
          className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Reset Defaults
        </button>
      </div>
    </div>
  );
}
