import React from "react";

function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/60 ${className}`}
      style={style}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#14263e] overflow-hidden">
      {/* Colored top accent strip */}
      <Bone className="h-1.5 w-full rounded-none" />
      <div className="p-6 space-y-4">
        {/* Icon + title */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Bone className="h-9 w-9 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Bone className="h-4 w-36" />
              <Bone className="h-3 w-20 rounded-full" />
            </div>
          </div>
          <Bone className="h-6 w-6 rounded-lg shrink-0" />
        </div>
        {/* Description */}
        <div className="space-y-1.5">
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-4/5" />
        </div>
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Bone className="h-3 w-20" />
            <Bone className="h-3 w-8" />
          </div>
          <Bone className="h-1.5 w-full rounded-full" />
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-3">
            <Bone className="h-3.5 w-14" />
            <Bone className="h-3.5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsLoading() {
  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 lg:p-8 bg-[#f0f4f8] dark:bg-[#0b1728]">
      <div className="relative min-h-0 space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <Bone className="h-9 w-32" />
            <Bone className="h-4 w-80" />
          </div>
        </div>

        <div className="space-y-5">

          {/* ── Filter bar + New Project button ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Bone className="h-9 w-52 rounded-xl" />
              <Bone className="h-9 w-24 rounded-xl" />
              <Bone className="h-9 w-20 rounded-xl" />
              <Bone className="h-9 w-24 rounded-xl" />
              <Bone className="h-9 w-20 rounded-xl" />
              <Bone className="h-9 w-24 rounded-xl" />
            </div>
            <Bone className="h-10 w-36 rounded-xl shrink-0 self-start sm:self-auto" />
          </div>

          {/* ── Results counter + View toggle ── */}
          <div className="flex justify-between items-center">
            <Bone className="h-4 w-32" />
            <Bone className="h-8 w-16 rounded-xl" />
          </div>

          {/* ── Project Cards Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
