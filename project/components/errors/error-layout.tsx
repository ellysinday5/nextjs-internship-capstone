"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   ErrorLayout — full-page centered error card used by root-level error pages
   (404, 500, 403, etc.). Uses the dark-blue SyntraFlow brand theme.

   Props:
   - illustration  ReactNode  — an <*Illustration /> from error-illustrations.tsx
   - code          string     — optional HTTP-ish error code label (e.g. "404")
   - title         string     — short, human headline
   - description   string     — one- or two-sentence explanation
   - primaryAction            — main CTA (href *or* onClick)
   - secondaryAction          — optional secondary CTA
───────────────────────────────────────────────────────────────────────────── */

export interface ErrorAction {
  label: string;
  /** If set, renders a Next.js Link. Takes priority over onClick. */
  href?: string;
  /** If no href, called on button click. */
  onClick?: () => void;
}

export interface ErrorLayoutProps {
  illustration: ReactNode;
  code?: string | number;
  title: string;
  description: string;
  primaryAction: ErrorAction;
  secondaryAction?: ErrorAction;
}

// ── Action button helper ───────────────────────────────────────────────────────
function ActionBtn({
  action,
  variant,
}: {
  action: ErrorAction;
  variant: "primary" | "secondary";
}) {
  const baseClass =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4d8fff]";

  const variantClass =
    variant === "primary"
      ? "bg-[#0033a0] hover:bg-[#002a80] active:bg-[#001f6b] text-white shadow-lg shadow-[#0033a0]/30 hover:shadow-xl hover:shadow-[#0033a0]/40 hover:-translate-y-0.5"
      : "bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 hover:border-white/25 hover:-translate-y-0.5";

  const combinedClass = `${baseClass} ${variantClass}`;

  if (action.href) {
    return (
      <Link href={action.href} className={combinedClass}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={combinedClass}>
      {action.label}
    </button>
  );
}

// ── Main layout ────────────────────────────────────────────────────────────────
export function ErrorLayout({
  illustration,
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
}: ErrorLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#060e1f] via-[#0a1628] to-[#0f2347] p-4 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-[#0033a0]/12 blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-[#0052cc]/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#001f6b]/8 blur-2xl" />
      </div>

      {/* Dot-grid overlay for texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center gap-8 animate-[fadeInUp_0.4s_ease-out_both]">
        {/* SyntraFlow wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0033a0] flex items-center justify-center shadow-lg shadow-[#0033a0]/50">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8.5L6.5 12L13 4"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-tight">SyntraFlow</span>
        </div>

        {/* Illustration with ambient ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#0033a0]/15 blur-2xl scale-150" />
          <div className="relative p-4">{illustration}</div>
        </div>

        {/* Error code + text */}
        <div className="space-y-3 px-4">
          {code != null && (
            <p className="text-[#4d8fff] text-xs font-mono font-bold tracking-[0.2em] uppercase">
              Error {code}
            </p>
          )}
          <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-white/55 text-sm leading-relaxed">{description}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <ActionBtn action={primaryAction} variant="primary" />
          {secondaryAction && <ActionBtn action={secondaryAction} variant="secondary" />}
        </div>

        {/* Footer note */}
        <p className="text-white/25 text-xs">
          If this keeps happening,{" "}
          <a
            href="mailto:support@syntraflow.com"
            className="underline underline-offset-2 hover:text-white/50 transition-colors"
          >
            contact support
          </a>
          .
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
