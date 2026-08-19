"use client";

import {
  type DisplayDensity,
  type FontSize,
  type Theme,
  useTheme,
} from "@/components/ui/theme-provider";
import { sileo } from "@/utils/alerts";
import {
  CheckCircle2,
  Layers,
  Monitor,
  Moon,
  Paintbrush,
  Shield,
  Sliders,
  Sun,
  Type,
  Zap,
} from "lucide-react";
import React from "react";

const ACCENT_COLORS = [
  { hex: "#0052cc", label: "Blue" },
  { hex: "#7c3aed", label: "Violet" },
  { hex: "#059669", label: "Green" },
  { hex: "#dc2626", label: "Red" },
  { hex: "#d97706", label: "Amber" },
  { hex: "#0891b2", label: "Cyan" },
  { hex: "#db2777", label: "Pink" },
  { hex: "#475569", label: "Slate" },
];

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

      {/* Accent color */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Paintbrush size={14} className="text-slate-400" />
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Accent Color
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {ACCENT_COLORS.map(({ hex, label }) => (
            <button
              key={hex}
              type="button"
              onClick={() => {
                setAccentColor(hex);
                sileo.success(`Accent color set to ${label}.`, "Color Applied");
              }}
              title={label}
              className={`w-8 h-8 rounded-full transition-all hover:scale-110 cursor-pointer ${
                accentColor === hex
                  ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110"
                  : ""
              }`}
              style={{ backgroundColor: hex }}
            >
              {accentColor === hex && <CheckCircle2 size={14} className="text-white mx-auto" />}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          Selected:{" "}
          <span className="font-bold" style={{ color: accentColor }}>
            {ACCENT_COLORS.find((c) => c.hex === accentColor)?.label || accentColor}
          </span>
        </p>
      </div>

      {/* Live UI preview with active accent */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: accentColor }}
          >
            <Sliders size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              Active System Palette
            </p>
            <p className="text-[11px] text-slate-400">Previewing live buttons and accents</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3.5 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs"
            style={{ backgroundColor: accentColor }}
          >
            Active Button
          </button>
          <span
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            Tag Badge
          </span>
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

      {/* Density */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers size={14} className="text-slate-400" />
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Display Density
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "comfortable" as DisplayDensity, label: "Comfortable", desc: "More spacing" },
            { key: "cozy" as DisplayDensity, label: "Cozy", desc: "Balanced standard" },
            { key: "compact" as DisplayDensity, label: "Compact", desc: "Less spacing" },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setDensity(key);
                sileo.success(`Layout density set to ${label}.`, "Density Updated");
              }}
              className={`py-3 px-3 rounded-xl border-2 font-semibold transition-all text-left cursor-pointer ${
                density === key
                  ? "border-[#0052cc] bg-[#0052cc]/8 text-[#0052cc] dark:text-sky-400"
                  : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-bold">{label}</p>
              <p className="text-[10px] mt-0.5 text-slate-400">{desc}</p>
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
