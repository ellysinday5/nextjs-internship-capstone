"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Hand,
  Users,
  CheckCircle2,
  LayoutDashboard,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

export default function HomePage() {
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  const heroReveal = useReveal();
  const featReveal = useReveal();

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = now
    ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
    : "";

  const formattedDate = now
    ? now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : "";

  const features = [
    {
      icon: Hand,
      title: "Drag & Drop Workspaces",
      description: "Fluid Kanban boards — rearrange cards, rename columns, and set custom workflows without friction.",
    },
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "Assign tasks, share feedback, and monitor progress across team members instantly.",
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Velocity metrics, burndown charts, and milestone tracking to keep sprints on schedule.",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access",
      description: "Granular permissions for owners, members, and collaborators across all projects.",
    },
  ];

  const stagger = (i: number) => `${i * 60}ms`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1a2f] text-slate-900 dark:text-white flex flex-col transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      <div className="w-full px-6 sm:px-10 lg:px-16 pt-3 pb-1">
        <div className="container mx-auto max-w-6xl flex items-center justify-end">
          {mounted && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{formattedTime}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 flex flex-col">
        {/* ── Hero Section ── */}
        <section className="relative px-6 sm:px-10 lg:px-16 pt-12 sm:pt-20 pb-16 overflow-hidden bg-white dark:bg-[#0a1a2f]">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.06) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <div
              ref={heroReveal.ref}
              className={`transition-all duration-700 ${
                heroReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold mb-6">
                <Sparkles size={14} className="text-amber-500" />
                <span>Next.js Capstone Project</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">Stratpoint</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#0d1b2e] dark:text-white tracking-tight leading-[1.1] mb-6">
                Project Management System
              </h1>

              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 mb-9 leading-relaxed max-w-2xl mx-auto">
                Kanban boards, team collaboration, and real-time task tracking — in one focused workspace.
              </p>
              <div className="flex justify-center mb-10">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#142843] hover:bg-[#1c3960] dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-bold text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <LayoutDashboard size={20} />
                  <span>Start Managing Projects</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Hand size={14} className="text-[#142843] dark:text-sky-400" />
                  Drag & Drop Kanban
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} className="text-[#142843] dark:text-sky-400" />
                  Team Workspaces
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#142843] dark:text-sky-400" />
                  Task Tracking
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Platform Capabilities Section ── */}
        <section className="px-6 sm:px-10 lg:px-16 py-16 sm:py-24 bg-slate-50/70 dark:bg-[#071324] border-t border-slate-100 dark:border-white/5">
          <div className="container mx-auto max-w-6xl">
            <div
              ref={featReveal.ref}
              className={`transition-all duration-700 ${
                featReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <div className="lg:col-span-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#142843] dark:text-sky-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Platform Capabilities
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d1b2e] dark:text-white tracking-tight mb-4 leading-snug">
                    Everything your team needs to ship faster.
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                    SyntraFlow is a production-grade Kanban workspace built end-to-end with Next.js 16, TypeScript, Drizzle ORM, and Clerk — designed to keep distributed teams aligned.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {["Next.js 16", "TypeScript", "Tailwind CSS", "Drizzle ORM", "Clerk Auth", "PostgreSQL"].map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0e2139] hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 hover:shadow-md transition-all duration-200 group"
                      style={{ transitionDelay: stagger(idx) }}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#142843]/8 dark:bg-sky-500/10 text-[#142843] dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <feat.icon size={18} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{feat.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
