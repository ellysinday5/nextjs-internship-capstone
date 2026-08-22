"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hand,
  Layers,
  LayoutDashboard,
  Mail,
  Plus,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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

/* ─── Slide 1: Kanban Board ──────────────────────────────────── */
function KanbanSlide() {
  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1e35] shadow-xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1a2f]">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-amber-400" />
        <span className="w-3 h-3 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[11px] font-semibold text-slate-400">
          SyntraFlow · Sprint Board
        </span>
      </div>
      <div className="p-4 flex gap-3">
        {[
          {
            col: "To Do",
            color: "text-slate-500 dark:text-slate-400",
            dot: "bg-slate-400",
            cards: [
              {
                title: "Design system tokens",
                tag: "Design",
                tagColor:
                  "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
              },
              {
                title: "Auth middleware",
                tag: "Backend",
                tagColor: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
              },
            ],
          },
          {
            col: "In Progress",
            color: "text-blue-600 dark:text-blue-400",
            dot: "bg-blue-500",
            cards: [
              {
                title: "Kanban drag & drop",
                tag: "Frontend",
                tagColor: "bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300",
              },
              {
                title: "Analytics dashboard",
                tag: "Frontend",
                tagColor: "bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300",
              },
            ],
          },
          {
            col: "Done",
            color: "text-emerald-600 dark:text-emerald-400",
            dot: "bg-emerald-500",
            cards: [
              {
                title: "DB schema + ORM",
                tag: "Backend",
                tagColor:
                  "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
              },
              {
                title: "Clerk auth setup",
                tag: "Auth",
                tagColor: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
              },
            ],
          },
        ].map((col) => (
          <div key={col.col} className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider truncate ${col.color}`}
              >
                {col.col}
              </span>
              <span className="ml-auto text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full shrink-0">
                {col.cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {col.cards.map((card, ci) => (
                <div
                  key={ci}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#14263e]"
                >
                  <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-2">
                    {card.title}
                  </p>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${card.tagColor}`}
                  >
                    {card.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0a1a2f]/60">
        <div className="flex -space-x-1.5">
          {[
            ["#0052cc", "E"],
            ["#7c3aed", "J"],
            ["#059669", "M"],
          ].map(([c, l]) => (
            <span
              key={c}
              className="w-5 h-5 rounded-full border-2 border-white dark:border-[#0e1e35] flex items-center justify-center text-white text-[8px] font-black"
              style={{ backgroundColor: c }}
            >
              {l}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">3 members active</span>
      </div>
    </div>
  );
}

/* ─── Slide 2: Team & Invite ─────────────────────────────────── */
function TeamSlide() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1e35] shadow-xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1a2f]">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-amber-400" />
        <span className="w-3 h-3 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[11px] font-semibold text-slate-400">SyntraFlow · Team</span>
      </div>
      <div className="p-5 space-y-4">
        {/* create team */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#14263e]">
          <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
            Create a Team
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-black shrink-0">
              SF
            </div>
            <div className="flex-1 h-7 rounded-lg bg-white dark:bg-[#0e1e35] border border-slate-200 dark:border-slate-600 px-2.5 flex items-center">
              <span className="text-[11px] text-slate-400">Team name…</span>
            </div>
          </div>
          <div className="h-7 rounded-lg bg-[#0f2d5a] flex items-center justify-center gap-1.5">
            <Plus size={11} className="text-white" />
            <span className="text-[10px] font-bold text-white">Create Team</span>
          </div>
        </div>

        {/* invite members */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#14263e]">
          <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
            Invite Members
          </p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 h-7 rounded-lg bg-white dark:bg-[#0e1e35] border border-slate-200 dark:border-slate-600 px-2.5 flex items-center">
              <span className="text-[11px] text-slate-400">member@email.com</span>
            </div>
            <div className="h-7 px-2.5 rounded-lg bg-blue-600 flex items-center justify-center">
              <UserPlus size={12} className="text-white" />
            </div>
          </div>
          {/* pending invites */}
          <div className="space-y-1.5">
            {[
              {
                name: "James R.",
                role: "Developer",
                color: "#7c3aed",
                initial: "J",
                status: "Pending",
              },
              {
                name: "Maria T.",
                role: "Designer",
                color: "#059669",
                initial: "M",
                status: "Accepted",
              },
            ].map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-[#0e1e35] border border-slate-100 dark:border-slate-700"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0"
                  style={{ backgroundColor: m.color }}
                >
                  {m.initial}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-800 dark:text-white truncate">
                    {m.name}
                  </p>
                  <p className="text-[9px] text-slate-400">{m.role}</p>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${m.status === "Accepted" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"}`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 3: Calendar + Add Event ─────────────────────────── */
function CalendarSlide() {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const cells = [
    null,
    null,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    null,
    null,
  ];
  const events: Record<number, string> = {
    8: "bg-blue-500",
    15: "bg-violet-500",
    22: "bg-emerald-500",
    28: "bg-amber-500",
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1e35] shadow-xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1a2f]">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-amber-400" />
        <span className="w-3 h-3 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[11px] font-semibold text-slate-400">SyntraFlow · Calendar</span>
      </div>
      <div className="flex gap-0">
        {/* mini calendar */}
        <div className="flex-1 p-4 border-r border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-white">August 2026</span>
            <div className="flex gap-1">
              <button className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600">
                <ChevronLeft size={10} />
              </button>
              <button className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600">
                <ChevronRight size={10} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {days.map((d) => (
              <div key={d} className="text-[8px] font-bold text-slate-400 text-center py-0.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => (
              <div
                key={i}
                className={`relative h-6 flex items-center justify-center rounded text-[9px] font-semibold transition-colors ${
                  d === 12
                    ? "bg-[#0f2d5a] text-white rounded-lg"
                    : d
                      ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      : ""
                }`}
              >
                {d}
                {d && events[d] && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${events[d]}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* add event panel */}
        <div className="w-[160px] p-4 flex flex-col gap-3">
          <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            New Event
          </p>
          <div className="space-y-2">
            <div className="h-7 rounded-lg bg-slate-50 dark:bg-[#14263e] border border-slate-200 dark:border-slate-600 px-2.5 flex items-center">
              <span className="text-[10px] text-slate-400">Event title…</span>
            </div>
            <div className="h-7 rounded-lg bg-slate-50 dark:bg-[#14263e] border border-slate-200 dark:border-slate-600 px-2.5 flex items-center gap-1.5">
              <Calendar size={10} className="text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-400">Aug 12, 2026</span>
            </div>
            <div className="h-7 rounded-lg bg-slate-50 dark:bg-[#14263e] border border-slate-200 dark:border-slate-600 px-2.5 flex items-center gap-1.5">
              <Clock size={10} className="text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-400">09:00 AM</span>
            </div>
          </div>
          {/* event type */}
          <div className="flex flex-wrap gap-1">
            {[
              {
                label: "Meeting",
                color: "bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300",
                active: true,
              },
              {
                label: "Task",
                color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300",
                active: false,
              },
              {
                label: "Deadline",
                color: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
                active: false,
              },
            ].map(({ label, color, active }) => (
              <span
                key={label}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md cursor-pointer ${active ? color : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-7 rounded-lg bg-[#0f2d5a] flex items-center justify-center gap-1.5 mt-auto">
            <Plus size={11} className="text-white" />
            <span className="text-[10px] font-bold text-white">Add Event</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Carousel wrapper ───────────────────────────────────────── */
const slides = [
  { label: "Kanban Board", icon: Layers, component: KanbanSlide },
  { label: "Team & Invite", icon: Users, component: TeamSlide },
  { label: "Calendar", icon: Calendar, component: CalendarSlide },
];

function FeatureCarousel({ visible }: { visible: boolean }) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setActive(idx);
        setAnimating(false);
      }, 200);
    },
    [animating],
  );

  // Auto-advance every 4 s
  useEffect(() => {
    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const Slide = slides[active].component;

  return (
    <div
      className={`transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
    >
      {/* tab pills */}

      {/* slide */}
      <div className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}>
        <Slide />
      </div>

      {/* dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-1.5 bg-[#0f2d5a] dark:bg-blue-400" : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"}`}
          />
        ))}
      </div>
    </div>
  );
}

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
      icon: ShieldCheck,
      title: "Secure auth",
      description: "Built on Clerk, ready for teams.",
      color: "bg-emerald-100 dark:bg-emerald-950/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      border: "hover:border-emerald-200 dark:hover:border-emerald-800",
    },
    {
      icon: Mail,
      title: "Email invites",
      description: "Bring your team in, one click away.",
      color: "bg-amber-100 dark:bg-amber-950/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      border: "hover:border-amber-200 dark:hover:border-amber-800",
    },
    {
      icon: BarChart3,
      title: "Progress analytics",
      description: "Velocity charts and milestone tracking.",
      color: "bg-sky-100 dark:bg-sky-950/60",
      iconColor: "text-sky-600 dark:text-sky-400",
      border: "hover:border-sky-200 dark:hover:border-sky-800",
    },
    {
      icon: CheckCircle2,
      title: "Live task tracking",
      description: "Status updates, always in view.",
      color: "bg-rose-100 dark:bg-rose-950/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      border: "hover:border-rose-200 dark:hover:border-rose-800",
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

              {/* right — feature carousel */}
              <FeatureCarousel visible={heroReveal.visible} />
            </div>
          </div>
        </section>

        {/* ── FEATURES STRIP ── */}
        <section className="px-4 sm:px-6 lg:px-10 py-14 sm:py-20 bg-slate-50/70 dark:bg-[#0a1525] border-t border-slate-100 dark:border-slate-800/60">
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
