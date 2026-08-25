"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import {
  BarChart3,
  ChevronRight,
  Hand,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Scroll-reveal hook ─────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

import { FeatureCarousel } from "@/components/landing/FeatureCarousel";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const heroReveal = useReveal(0.05);
  const featReveal = useReveal(0.08);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = now
    ? now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";
  const formattedDate = now
    ? now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const features = [
    {
      icon: Hand,
      title: "Drag & drop boards",
      description: "Rearrange without friction.",
      color: "bg-blue-100 dark:bg-blue-950/60",
      iconColor: "text-blue-600 dark:text-blue-400",
      border: "hover:border-blue-200 dark:hover:border-blue-800",
    },
    {
      icon: Users,
      title: "Team workspaces",
      description: "Assign and track together, in real time.",
      color: "bg-violet-100 dark:bg-violet-950/60",
      iconColor: "text-violet-600 dark:text-violet-400",
      border: "hover:border-violet-200 dark:hover:border-violet-800",
    },
    {
      icon: BarChart3,
      title: "Progress analytics",
      description: "Velocity charts and milestone tracking.",
      color: "bg-sky-100 dark:bg-sky-950/60",
      iconColor: "text-sky-600 dark:text-sky-400",
      border: "hover:border-sky-200 dark:hover:border-sky-800",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#070f1c] text-slate-900 dark:text-white flex flex-col overflow-x-hidden">
      <Navbar />

      {/* live clock */}
      {mounted && (
        <div className="w-full px-4 sm:px-6 lg:px-10 pt-3 pb-1">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                {formattedTime}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {/* ── HERO ── */}
        <section className="relative px-4 sm:px-6 lg:px-10 pt-14 sm:pt-22 pb-18 overflow-hidden bg-white dark:bg-[#070f1c]">
          {/* background orbs */}
          <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-400/8 dark:bg-blue-500/8 blur-3xl" />
            <div className="absolute top-0 right-0 w-[380px] h-[380px] rounded-full bg-violet-400/8 dark:bg-violet-500/6 blur-3xl" />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.05) 1px,transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
          </div>

          <div className="relative z-10">
            <div
              ref={heroReveal.ref}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center transition-all duration-700 ${
                heroReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {/* left */}
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/8 border border-slate-200 dark:border-white/12 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-7">
                  <Sparkles size={13} className="text-amber-500" />
                  Next.js Capstone · Stratpoint
                </div>

                <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.06] text-[#0d1b2e] dark:text-white mb-5">
                  Plan work and{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                    watch it flow.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-9 max-w-md">
                  Kanban boards, team workspaces, and task tracking — all in one focused workspace.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#0f2d5a] hover:bg-[#0c2447] text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <LayoutDashboard size={17} />
                    Start managing projects
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Create team
                  </Link>
                </div>

                {/* mini feature tags — removed */}
              </div>

              {/* right — feature showcase carousel */}
              <div
                className={`transition-all duration-1000 delay-300 ${
                  heroReveal.visible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-8"
                }`}
              >
                <FeatureCarousel />
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES STRIP ── */}
        <section className="px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
          <div>
            <div
              ref={featReveal.ref}
              className={`transition-all duration-700 ${featReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className={`group flex items-start gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0e1e35] hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${feat.border}`}
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${feat.color} flex items-center justify-center shrink-0 ${feat.iconColor} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <feat.icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
