"use client";

import { AnimatedBrandIntro, AnimatedBrandIntroProps } from "./animated-brand-intro";

/* ─────────────────────────────────────────────────────────────
   Auth Illustration
   Renders the Animated Brand Intro sequence on sign-in and sign-up pages.
───────────────────────────────────────────────────────────── */
export function AuthIllustration(props: AnimatedBrandIntroProps) {
  return <AnimatedBrandIntro {...props} />;
}

export { AnimatedBrandIntro };
