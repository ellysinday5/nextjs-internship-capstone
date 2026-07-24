"use client"

import React from "react"

export function CodeBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
      {/* Clean Minimalist Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 dark:opacity-40" />

      {/* Ambient Soft Radial Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue_munsell-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />

      {/* Geometric Rectangles & Big Squares at the Sides (Minimalist Architectural Theme) */}
      
      {/* Top Left: Floating Rounded Glass Square */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 dark:border-white/10 backdrop-blur-2xl transform -rotate-12" />

      {/* Mid Left: Slim Vertical Geometric Rectangle Accent */}
      <div className="absolute top-1/3 -left-8 w-24 h-96 rounded-2xl bg-gradient-to-b from-teal-500/10 via-blue-500/5 to-transparent border border-teal-500/15 dark:border-white/5 backdrop-blur-xl transform rotate-6 hidden md:block" />

      {/* Top Right: Tilted Accent Square */}
      <div className="absolute top-16 -right-16 w-80 h-80 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 dark:border-white/10 backdrop-blur-2xl transform rotate-12" />

      {/* Bottom Right: Big Glass Rectangle at Side */}
      <div className="absolute bottom-12 -right-12 w-96 h-72 rounded-3xl bg-gradient-to-tr from-blue_munsell-500/10 via-sky-500/5 to-transparent border border-blue_munsell-500/20 dark:border-white/10 backdrop-blur-2xl transform -rotate-6 hidden sm:block" />

      {/* Bottom Left: Floating Soft Square */}
      <div className="absolute -bottom-16 left-1/4 w-72 h-72 rounded-3xl bg-gradient-to-tl from-slate-500/10 to-transparent border border-slate-400/15 dark:border-white/5 backdrop-blur-xl transform rotate-45 hidden lg:block" />
    </div>
  )
}
