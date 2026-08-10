"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface AnimatedBrandIntroProps {
  /** Path to the brand logo image (default: "/syntraflow-full.svg") */
  logoSrc?: string;
  /** Duration for each stage in milliseconds (default: 3500ms -> 7s total loop) */
  stageDuration?: number;
  /** Duration for cross-fade transition in seconds (default: 0.6s) */
  transitionDuration?: number;
  /** Custom colors for Stage 1 bar-graph graphic */
  barColors?: {
    bar1?: string;
    bar2?: string;
    bar3?: string;
    flowLine?: string;
  };
  /** Additional custom class names for root container */
  className?: string;
}

/* ─────────────────────────────────────────────────────────────
   Stage 1: Bar-Graph Logo Animation (Light/White Theme)
───────────────────────────────────────────────────────────── */
function StageBarGraph({ barColors = {} }: { barColors?: AnimatedBrandIntroProps["barColors"] }) {
  const color1 = barColors?.bar1 || "#142843";
  const color2 = barColors?.bar2 || "#00b4d8";
  const color3 = barColors?.bar3 || "#1c3457";
  const flowColor = barColors?.flowLine || "#00b4d8";

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 w-full h-full">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            <linearGradient id="barGradMidLightIntro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4e8" />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
            <linearGradient id="flowGradLightIntro" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#142843" />
              <stop offset="100%" stopColor={flowColor} />
            </linearGradient>
          </defs>

          {/* Bar 1 (Left - Navy) */}
          <motion.rect
            x="20"
            y="52"
            width="18"
            height="46"
            rx="5"
            fill={color1}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ transformOrigin: "bottom" }}
          />

          {/* Bar 2 (Middle - Cyan Gradient) */}
          <motion.rect
            x="48"
            y="26"
            width="22"
            height="72"
            rx="6"
            fill="url(#barGradMidLightIntro)"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "bottom" }}
          />

          {/* Bar 3 (Right - Navy Accent) */}
          <motion.rect
            x="78"
            y="64"
            width="18"
            height="34"
            rx="5"
            fill={color3}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            style={{ transformOrigin: "bottom" }}
          />

          {/* Flowing curve line */}
          <motion.path
            d="M 12 56 C 42 22, 68 54, 98 24"
            fill="none"
            stroke="url(#flowGradLightIntro)"
            strokeWidth="5.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.45, ease: "easeInOut" }}
          />

          {/* Sparkle node at end of flow line */}
          <motion.circle
            cx="98"
            cy="24"
            r="4.5"
            fill={flowColor}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.35 }}
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-3"
      >
        <span className="text-xl font-extrabold tracking-tight text-[#142843]">
          Syntra<span className="text-[#00b4d8]">Flow</span>
        </span>
        <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
          Workflow Analytics
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Stage 2: Solo Full Brand Logo (White Theme)
───────────────────────────────────────────────────────────── */
function StageSoloLogo({ logoSrc }: { logoSrc: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 w-full h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-col items-center justify-center"
      >
        <img
          src={logoSrc}
          alt="SyntraFlow Brand"
          className="w-56 sm:w-64 max-w-full h-auto object-contain drop-shadow-md"
        />
        <p className="text-xs text-slate-500 font-medium mt-4 max-w-[240px]">
          Empowering your team with unified project intelligence
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Animated Brand Intro Component
───────────────────────────────────────────────────────────── */
export function AnimatedBrandIntro({
  logoSrc = "/syntraflow-full.svg",
  stageDuration = 3500,
  transitionDuration = 0.6,
  barColors,
  className = "",
}: AnimatedBrandIntroProps) {
  const shouldReduceMotion = useReducedMotion();
  const prefersReduced = Boolean(shouldReduceMotion);
  const [stage, setStage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setStage(1);
      return;
    }

    const timer = setTimeout(() => {
      setStage((prev) => (prev + 1) % 2);
    }, stageDuration);

    return () => clearTimeout(timer);
  }, [stage, stageDuration, prefersReduced]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center p-4 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{
            duration: transitionDuration,
            ease: [0.25, 1, 0.5, 1],
          }}
          className="w-full h-full flex flex-col items-center justify-center"
        >
          {stage === 0 && <StageBarGraph barColors={barColors} />}
          {stage === 1 && <StageSoloLogo logoSrc={logoSrc} />}
        </motion.div>
      </AnimatePresence>

      {mounted && !prefersReduced && (
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5 z-20">
          {[0, 1].map((idx) => (
            <button
              key={idx}
              type="button"
              suppressHydrationWarning
              onClick={() => setStage(idx)}
              aria-label={`Go to animation stage ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                stage === idx ? "w-6 bg-[#00b4d8]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
