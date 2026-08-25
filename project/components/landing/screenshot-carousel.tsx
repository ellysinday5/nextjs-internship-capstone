"use client";

import {
  Activity,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Layers,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export interface SkeletonSlide {
  id: string;
  label: string;
  badge: string;
  urlBar: string;
  title: string;
  description: string;
  icon: React.ElementType;
  theme: {
    iconBg: string;
    iconColor: string;
    barPrimary: string;
    barSecondary: string;
    accentBg: string;
  };
}

export const SKELETON_SLIDES: SkeletonSlide[] = [
  {
    id: "capacity",
    label: "Capacity",
    badge: "Workspace View",
    urlBar: "syntraflow.app/projects",
    title: "Comprehensive capacity views",
    description: "Monitor your team's workload, project timelines, and progress in one place.",
    icon: BarChart3,
    theme: {
      iconBg: "bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60",
      iconColor: "text-blue-600 dark:text-blue-400",
      barPrimary: "bg-blue-200/90 dark:bg-blue-900/70",
      barSecondary: "bg-blue-200/60 dark:bg-blue-900/40",
      accentBg: "from-blue-600 to-sky-400",
    },
  },
  {
    id: "activity",
    label: "Activity Feed",
    badge: "Real-time Live",
    urlBar: "syntraflow.app/team",
    title: "Real-time activity feed",
    description: "Stay updated with live activity across your workspace and never miss a beat.",
    icon: Activity,
    theme: {
      iconBg: "bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      barPrimary: "bg-emerald-200/90 dark:bg-emerald-900/70",
      barSecondary: "bg-emerald-200/60 dark:bg-emerald-900/40",
      accentBg: "from-emerald-600 to-teal-400",
    },
  },
  {
    id: "boards",
    label: "Sprint Boards",
    badge: "Kanban & Lists",
    urlBar: "syntraflow.app/board",
    title: "Intuitive sprint & Kanban boards",
    description: "Organize workflows, track task statuses, and drag items smoothly across lists.",
    icon: Layers,
    theme: {
      iconBg: "bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800/60",
      iconColor: "text-violet-600 dark:text-violet-400",
      barPrimary: "bg-violet-200/90 dark:bg-violet-900/70",
      barSecondary: "bg-violet-200/60 dark:bg-violet-900/40",
      accentBg: "from-violet-600 to-purple-400",
    },
  },
  {
    id: "schedules",
    label: "Schedules",
    badge: "Timeline Tracker",
    urlBar: "syntraflow.app/calendar",
    title: "Synchronized schedules & milestones",
    description: "Keep milestone deadlines and team schedules synchronized in real time.",
    icon: Calendar,
    theme: {
      iconBg: "bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      barPrimary: "bg-amber-200/90 dark:bg-amber-900/70",
      barSecondary: "bg-amber-200/60 dark:bg-amber-900/40",
      accentBg: "from-amber-600 to-orange-400",
    },
  },
];

interface ScreenshotCarouselProps {
  visible?: boolean;
}

export function ScreenshotCarousel({ visible = true }: ScreenshotCarouselProps) {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (animating) return;
      setAnimating(true);
      setActive(idx);
      setTimeout(() => setAnimating(false), 200);
    },
    [animating],
  );

  const prevSlide = useCallback(() => {
    goTo((active - 1 + SKELETON_SLIDES.length) % SKELETON_SLIDES.length);
  }, [active, goTo]);

  const nextSlide = useCallback(() => {
    goTo((active + 1) % SKELETON_SLIDES.length);
  }, [active, goTo]);

  // Autoplay every 4.5 seconds when not hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SKELETON_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const currentSlide = SKELETON_SLIDES[active];

  return (
    <div
      className={`transition-all duration-1000 delay-300 w-full max-w-2xl lg:max-w-3xl mx-auto ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Navigation Pills */}
      <div className="flex items-center justify-center gap-1.5 p-1 mb-5 bg-slate-100/90 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/10 w-fit mx-auto shadow-xs">
        {SKELETON_SLIDES.map((slide, idx) => {
          const Icon = slide.icon;
          const isActive = idx === active;
          return (
            <button
              key={slide.id}
              onClick={() => goTo(idx)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#0f2d5a] text-white dark:bg-blue-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-[#0f2d5a] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={14} className={isActive ? "text-sky-300" : "text-slate-400"} />
              <span>{slide.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Showcase Card Frame */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#0e1e35] shadow-2xl p-5 sm:p-7 overflow-hidden group">
        {/* Top Browser Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 select-none">
          {/* Window control dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-400/90" />
            <span className="w-3 h-3 rounded-full bg-amber-400/90" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
          </div>

          {/* URL address indicator */}
          <div className="flex-1 max-w-[280px] sm:max-w-[340px] h-6.5 px-3 rounded-lg bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 shadow-2xs">
            <Lock size={10} className="text-emerald-500 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {currentSlide.urlBar}
            </span>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#0052cc] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full shrink-0 border border-blue-200/60 dark:border-blue-800/40">
            <Sparkles size={10} />
            <span>{currentSlide.badge}</span>
          </div>
        </div>

        {/* Skeleton Illustration Preview Box */}
        <div className="relative w-full rounded-2xl bg-slate-50/90 dark:bg-[#071322]/80 border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 min-h-[230px] sm:min-h-[260px] flex flex-col justify-between overflow-hidden">
          {SKELETON_SLIDES.map((slide, idx) => {
            const isCurrent = idx === active;
            const Icon = slide.icon;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isCurrent
                    ? "opacity-100 translate-x-0 z-10 pointer-events-auto"
                    : "opacity-0 translate-x-4 z-0 pointer-events-none"
                }`}
              >
                {/* Top Icon Badge Box */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl ${slide.theme.iconBg} flex items-center justify-center ${slide.theme.iconColor} shadow-xs`}
                  >
                    <Icon size={20} className="stroke-[2.2]" />
                  </div>
                  {/* Subtle live indicator pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Preview
                  </div>
                </div>

                {/* Middle Skeleton Placeholder Lines */}
                <div className="space-y-3 my-auto py-2">
                  <div
                    className={`h-4 sm:h-4.5 w-4/5 rounded-full ${slide.theme.barPrimary} transition-all duration-500`}
                  />
                  <div
                    className={`h-4 sm:h-4.5 w-3/5 rounded-full ${slide.theme.barSecondary} transition-all duration-500`}
                  />
                </div>

                {/* Bottom Overlapping Avatar Dots + Accent Meter */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-slate-50 dark:border-[#071322] shadow-xs" />
                    <div className="w-8 h-8 rounded-full bg-slate-400/80 dark:bg-slate-600 border-2 border-slate-50 dark:border-[#071322] shadow-xs" />
                  </div>
                  <div className="h-2 w-28 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full w-3/4 rounded-full bg-gradient-to-r ${slide.theme.accentBg}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Prev / Next Arrow Overlay */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous preview"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next preview"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Text Details Section Below the Skeleton Box */}
        <div className="pt-5 flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentSlide.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              {currentSlide.description}
            </p>
          </div>

          {/* Dot Indicator Indicators */}
          <div className="flex items-center gap-1.5 pt-2 shrink-0">
            {SKELETON_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === active
                    ? "w-6 h-2 bg-[#0f2d5a] dark:bg-blue-500"
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
