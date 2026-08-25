"use client";

import {
  FEATURE_SLIDES,
  type Slide,
} from "@/components/landing/feature-carousel-data";
import {
  CheckCircle2,
  Clock,
  Lock,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

export function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSelect = useCallback(
    (index: number) => {
      if (index === active || fading) return;

      if (prefersReducedMotion) {
        setActive(index);
        return;
      }

      setFading(true);
      timeoutRef.current = setTimeout(() => {
        setActive(index);
        setFading(false);
      }, 200);
    },
    [active, fading, prefersReducedMotion],
  );

  // Auto-advance to the next slide every 4.5 seconds (paused when hovered)
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      handleSelect((active + 1) % FEATURE_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [active, handleSelect, isHovered]);

  const currentSlide: Slide = FEATURE_SLIDES[active];
  const Icon = currentSlide.icon;

  /* ── 1. Capacity Visual ─────────────────────────────────── */
  function renderCapacityVisual() {
    return (
      <div className="flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#0033a0] dark:text-blue-400 shadow-xs">
            <Icon size={20} className="stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>84% Team Capacity</span>
          </div>
        </div>

        <div className="space-y-3 my-auto py-1">
          <div className="h-4 w-4/5 rounded-full bg-blue-200/90 dark:bg-blue-900/70" />
          <div className="h-4 w-3/5 rounded-full bg-blue-200/60 dark:bg-blue-900/40" />
          <div className="h-4 w-2/3 rounded-full bg-blue-200/40 dark:bg-blue-900/30" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-slate-50 dark:border-[#071322] flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
              ES
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900 border-2 border-slate-50 dark:border-[#071322] flex items-center justify-center text-[10px] font-bold text-[#0033a0] dark:text-blue-300">
              JR
            </div>
          </div>
          <div className="h-2 w-32 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#0033a0] to-[#00b4d8]" />
          </div>
        </div>
      </div>
    );
  }

  /* ── 2. Activity Visual ─────────────────────────────────── */
  function renderActivityVisual() {
    return (
      <div className="flex flex-col justify-between h-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
            <Icon size={20} className="stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </div>
        </div>

        <div className="space-y-2.5 my-auto">
          {[
            { text: "Maria completed Design Tokens review", time: "2m ago" },
            { text: "James moved API Route to Done", time: "14m ago" },
            { text: "Elly created Sprint Milestone #5", time: "1h ago" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[240px]">
                  {item.text}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>Real-time WebSocket events</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Connected</span>
        </div>
      </div>
    );
  }

  /* ── 3. Boards Visual ───────────────────────────────────── */
  function renderBoardsVisual() {
    return (
      <div className="flex flex-col justify-between h-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-xs">
            <Icon size={20} className="stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-800">
            <span>Sprint #14</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 my-auto">
          {[
            { col: "To Do", count: 3, dot: "bg-slate-400" },
            { col: "In Progress", count: 4, dot: "bg-[#0033a0]" },
            { col: "Done", count: 6, dot: "bg-emerald-500" },
          ].map((col, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                  {col.col}
                </span>
                <span className="text-slate-400 font-mono">{col.count}</span>
              </div>
              <div className="h-6 rounded-lg bg-slate-100 dark:bg-slate-700/50 p-1 flex items-center">
                <div className="h-2 w-3/4 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
          <span>Drag & drop enabled</span>
          <span className="text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
            <Plus size={11} /> Quick Add
          </span>
        </div>
      </div>
    );
  }

  /* ── 4. Schedules Visual ────────────────────────────────── */
  function renderSchedulesVisual() {
    return (
      <div className="flex flex-col justify-between h-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
            <Icon size={20} className="stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            <Clock size={11} />
            <span>August 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 my-auto">
          {[
            { day: "Mon 10", tag: "Sprint Kickoff", color: "bg-blue-500" },
            { day: "Wed 12", tag: "Design Sync", color: "bg-violet-500" },
            { day: "Thu 13", tag: "Database Backup", color: "bg-amber-500" },
            { day: "Fri 14", tag: "Release v2.4", color: "bg-emerald-500" },
          ].map((slot, i) => (
            <div
              key={i}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between h-16"
            >
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {slot.day}
              </span>
              <span
                className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded truncate ${slot.color}`}
              >
                {slot.tag}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
          <span>Synced with workspace calendar</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">4 Deadlines</span>
        </div>
      </div>
    );
  }

  function renderSlideContent() {
    switch (currentSlide.key) {
      case "capacity":
        return renderCapacityVisual();
      case "activity":
        return renderActivityVisual();
      case "boards":
        return renderBoardsVisual();
      case "schedules":
        return renderSchedulesVisual();
      default:
        return null;
    }
  }

  return (
    <div
      className="w-full max-w-2xl lg:max-w-3xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Top Pill-Style Tab Navigation ─────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 p-1 mb-5 bg-slate-100/90 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/10 w-fit mx-auto shadow-xs">
        {FEATURE_SLIDES.map((slide, idx) => {
          const TabIcon = slide.icon;
          const isActive = idx === active;
          return (
            <button
              key={slide.key}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#0033a0] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-[#0033a0] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
              }`}
            >
              <TabIcon
                size={14}
                className={isActive ? "text-sky-300" : "text-slate-400"}
              />
              <span>{slide.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Browser-Mockup Card Frame ─────────────────────────── */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#0e1e35] shadow-2xl p-5 sm:p-7 overflow-hidden">
        {/* Top Browser Bar (Static Shell) */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 select-none">
          {/* Traffic-light dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-400/90" />
            <span className="w-3 h-3 rounded-full bg-amber-400/90" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
          </div>

          {/* URL Bar */}
          <div className="flex-1 max-w-[280px] sm:max-w-[340px] h-6.5 px-3 rounded-lg bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 shadow-2xs">
            <Lock size={10} className="text-emerald-500 shrink-0" />
            <span
              className={`text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate transition-opacity duration-200 ${
                fading ? "opacity-0" : "opacity-100"
              }`}
            >
              syntraflow.app/{currentSlide.key}
            </span>
          </div>

          {/* Badge Top-Right */}
          <div
            className={`flex items-center gap-1 text-[10px] font-bold text-[#0033a0] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full shrink-0 border border-blue-200/60 dark:border-blue-800/40 transition-opacity duration-200 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            <Sparkles size={10} />
            <span>{currentSlide.badge}</span>
          </div>
        </div>

        {/* Content Area Inside Card (Dynamic Crossfade) */}
        <div className="relative w-full rounded-2xl bg-slate-50/90 dark:bg-[#071322]/80 border border-slate-100 dark:border-slate-800/80 p-5 sm:p-7 min-h-[240px] sm:min-h-[270px]">
          <div
            className={`h-full transition-opacity duration-200 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            {renderSlideContent()}
          </div>
        </div>

        {/* ── Below Card: Title/Description & Dot Indicators ───── */}
        <div className="pt-5 flex items-start justify-between gap-4">
          <div
            className={`space-y-1 flex-1 transition-opacity duration-200 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentSlide.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              {currentSlide.description}
            </p>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5 pt-2 shrink-0">
            {FEATURE_SLIDES.map((slide, i) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => handleSelect(i)}
                aria-label={`Go to ${slide.label} slide`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === active
                    ? "w-6 h-2 bg-[#0033a0] dark:bg-blue-500"
                    : "w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
