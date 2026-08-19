import type React from "react";

function Bone({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} style={style} />;
}

/* ── Shared header + tabs shell ─────────────────────────────────────────── */
function SkeletonShell({
  activeTabIndex = 0,
  noShell = false,
  children,
}: {
  activeTabIndex?: number;
  noShell?: boolean;
  children: React.ReactNode;
}) {
  if (noShell) {
    return <div className="flex flex-col flex-1 overflow-hidden animate-pulse">{children}</div>;
  }

  const TAB_WIDTHS = [32, 44, 40, 36, 64, 76, 60]; // List, Board, Table, Form, Timeline, Dashboard, Calendar

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-[#0f1d31] animate-pulse">
      {/* ── Project Header ── */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31] px-6 pt-4 pb-2">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bone className="h-8 w-8 rounded-lg shrink-0" />
            <Bone className="h-9 w-9 rounded-xl shrink-0" />
            <Bone className="h-6 w-44" />
            <Bone className="h-6 w-6 rounded-md" />
            <Bone className="h-7 w-28 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[0, 1, 2].map((i) => (
                <Bone key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
            <Bone className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      </header>

      {/* ── Tabs bar ── */}
      <div className="flex items-end border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31] px-6">
        {TAB_WIDTHS.map((w, i) => (
          <div key={i} className="flex flex-col items-center px-3 py-3 gap-1.5">
            <Bone className="h-3.5" style={{ width: w }} />
            {i === activeTabIndex && (
              <div className="h-0.5 w-full rounded-full bg-slate-300 dark:bg-slate-700" />
            )}
          </div>
        ))}
        <Bone className="ml-2 h-5 w-5 rounded-md self-center" />
      </div>

      {/* ── Tab content ── */}
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Overview skeleton  (index 0)
══════════════════════════════════════════════════════════════════════════ */
export function OverviewTabSkeleton({ noShell = false }: { noShell?: boolean } = {}) {
  return (
    <SkeletonShell activeTabIndex={0} noShell={noShell}>
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
        {/* Left column */}
        <div className="lg:col-span-8 p-6 space-y-8 overflow-y-auto">
          {/* Description */}
          <div className="space-y-3">
            <Bone className="h-5 w-40" />
            <div className="space-y-2">
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-5/6" />
              <Bone className="h-3.5 w-3/4" />
            </div>
          </div>

          {/* Project roles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Bone className="h-5 w-36" />
              <Bone className="h-7 w-28 rounded-lg" />
            </div>
            <div className="flex flex-wrap gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 min-w-[180px]"
                >
                  <Bone className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Bone className="h-3 w-24" />
                    <Bone className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected goals */}
          <div className="space-y-3">
            <Bone className="h-5 w-36" />
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col items-center gap-3">
              <Bone className="h-3 w-48" />
              <Bone className="h-7 w-24 rounded-lg" />
            </div>
          </div>

          {/* Connected portfolios */}
          <div className="space-y-3">
            <Bone className="h-5 w-44" />
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col items-center gap-3">
              <Bone className="h-3 w-52" />
              <Bone className="h-7 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 border-l border-slate-200 dark:border-slate-800 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-3">
            <Bone className="h-4 w-36" />
            <div className="flex gap-2 flex-wrap">
              {[80, 72, 80].map((w, i) => (
                <Bone key={i} className="h-7 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>
          <Bone className="h-3.5 w-28" />
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <Bone className="h-3.5 w-28" />
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <Bone className="h-3 w-3 rounded-full mt-0.5 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Bone className="h-3 w-28" />
                    <Bone className="h-2.5 w-full" />
                    <Bone className="h-2.5 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Activity */}
          <div className="space-y-4 pl-2 border-l border-dashed border-slate-300 dark:border-slate-700">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1">
                <Bone className="h-3.5 w-20" />
                <Bone className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   List skeleton  (index 1)
══════════════════════════════════════════════════════════════════════════ */
export function ListTabSkeleton({ noShell = false }: { noShell?: boolean } = {}) {
  return (
    <SkeletonShell activeTabIndex={1} noShell={noShell}>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 px-6 py-2.5">
          <Bone className="h-8 w-24 rounded-lg" />
          <Bone className="h-8 w-40 rounded-lg" />
          <Bone className="h-8 w-24 rounded-lg" />
          <Bone className="h-8 w-24 rounded-lg" />
          <Bone className="h-8 w-20 rounded-lg ml-auto" />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_180px_140px_120px_120px_40px] border-b border-slate-200 dark:border-slate-800 px-6 py-2 bg-slate-50/30 gap-2">
          {["Name", "Assignee", "Due date", "Priority", "Status", ""].map((_, i) => (
            <Bone key={i} className="h-3 w-16" />
          ))}
        </div>

        {/* Sections + rows */}
        <div className="flex-1 overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
          {[4, 0, 0, 0].map((rowCount, si) => (
            <div key={si} className="py-2">
              {/* Section header */}
              <div className="flex items-center gap-2 px-6 py-2">
                <Bone className="h-3.5 w-3.5 rounded-sm" />
                <Bone className="h-4 w-24" />
              </div>
              {/* Rows */}
              {Array.from({ length: rowCount }).map((_, ri) => (
                <div
                  key={ri}
                  className="grid grid-cols-[1fr_180px_140px_120px_120px_40px] items-center px-6 py-2 gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Bone className="h-4 w-4 rounded-full shrink-0" />
                    <Bone className="h-3.5 flex-1" style={{ width: `${60 + ri * 10}%` }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bone className="h-5 w-5 rounded-full shrink-0" />
                    <Bone className="h-3 w-20" />
                  </div>
                  <Bone className="h-3 w-14" />
                  <Bone className="h-5 w-16 rounded-md" />
                  <Bone className="h-5 w-16 rounded-md" />
                  <div />
                </div>
              ))}
              <div className="px-6 py-1.5">
                <Bone className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Board skeleton  (index 2)
══════════════════════════════════════════════════════════════════════════ */
export function BoardTabSkeleton({ noShell = false }: { noShell?: boolean } = {}) {
  // Column definitions: [columnName-width, card widths[]]
  const COLUMNS = [{ cards: [100, 80, 90, 75] }, { cards: [90] }, { cards: [] }, { cards: [] }];

  const inner = (
    <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0f1d31]">
      {/* ── Toolbar row matching ProjectToolbar ── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1d31]/50 px-6 py-3 flex-wrap gap-2">
        {/* Add task split-button */}
        <div className="flex gap-0">
          <Bone className="h-8 w-24 rounded-l-xl" />
          <Bone className="h-8 w-7 rounded-r-xl" style={{ marginLeft: 1 }} />
        </div>
        {/* Right-side search + filters */}
        <div className="flex items-center gap-2">
          <Bone className="h-8 w-52 rounded-xl" />
          <Bone className="h-8 w-24 rounded-xl" />
          <Bone className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* ── Board scroll container ── */}
      <div className="flex flex-1 items-start gap-3 overflow-x-auto overflow-y-auto p-5 pb-8">
        {COLUMNS.map((col, ci) => (
          <div
            key={ci}
            className="flex w-[272px] flex-shrink-0 flex-col rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-[#f5f6f7] dark:bg-[#14263e]/70"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <div className="flex items-center gap-1.5">
                <Bone className="h-3.5 w-16" />
                <Bone className="h-3.5 w-4" />
              </div>
              <Bone className="h-5 w-5 rounded-md" />
            </div>
            {/* Task cards */}
            <div className="flex flex-col gap-2 px-2.5 pb-1 min-h-[48px]">
              {col.cards.map((w, ti) => (
                <div
                  key={ti}
                  className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0f1d31] p-3.5 space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <Bone className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                    <Bone className="h-3.5 flex-1" style={{ width: `${w}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Bone className="h-5 w-5 rounded-full" />
                    <Bone className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>
            {/* Add task row */}
            <div className="px-2.5 pb-2.5 pt-1">
              <Bone className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        ))}

        {/* + Add section dashed button */}
        <div className="w-[272px] flex-shrink-0">
          <Bone className="h-9 w-full rounded-xl" style={{ borderStyle: "dashed", opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );

  if (noShell) return inner;

  return (
    <SkeletonShell activeTabIndex={2} noShell={false}>
      {inner}
    </SkeletonShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Timeline skeleton  (index 3)
══════════════════════════════════════════════════════════════════════════ */
export function TimelineTabSkeleton({ noShell = false }: { noShell?: boolean } = {}) {
  return (
    <SkeletonShell activeTabIndex={3} noShell={noShell}>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 px-6 py-2.5">
          <Bone className="h-8 w-24 rounded-lg" />
          <Bone className="h-8 w-40 rounded-lg" />
          <Bone className="h-8 w-24 rounded-lg" />
          <Bone className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex-1 p-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            {/* Day headers */}
            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Bone key={i} className="h-3 w-full" />
              ))}
            </div>
            {/* Task bars */}
            {[
              { left: "0%", w: "35%" },
              { left: "15%", w: "30%" },
              { left: "30%", w: "25%" },
              { left: "5%", w: "40%" },
            ].map((bar, i) => (
              <div key={i} className="relative h-9">
                <Bone
                  className="absolute h-9 rounded-xl"
                  style={{ left: bar.left, width: bar.w }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Dashboard skeleton  (index 4)
══════════════════════════════════════════════════════════════════════════ */
export function DashboardTabSkeleton({ noShell = false }: { noShell?: boolean } = {}) {
  return (
    <SkeletonShell activeTabIndex={4} noShell={noShell}>
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0f1d31]/50 space-y-6">
        {/* Add widget btn */}
        <Bone className="h-8 w-28 rounded-lg" />
        {/* 4 stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
            >
              <Bone className="h-3 w-32" />
              <Bone className="h-9 w-16" />
              <Bone className="h-3 w-16" />
            </div>
          ))}
        </div>
        {/* 2 chart cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
            >
              <Bone className="h-4 w-48" />
              <div className="h-44 flex items-end justify-around border-b border-slate-200 dark:border-slate-800 pb-2 gap-3">
                {[80, 20, 20].map((h, j) => (
                  <div key={j} className="flex flex-col items-center gap-2 flex-1">
                    <Bone className="w-full rounded-t-lg" style={{ height: h }} />
                    <Bone className="h-3 w-10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Calendar skeleton  (index 5)
══════════════════════════════════════════════════════════════════════════ */
export function CalendarTabSkeleton({ noShell = false }: { noShell?: boolean } = {}) {
  return (
    <SkeletonShell activeTabIndex={5} noShell={noShell}>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 px-6 py-2.5">
          <Bone className="h-8 w-24 rounded-lg" />
          <div className="flex items-center gap-1">
            <Bone className="h-6 w-6 rounded" />
            <Bone className="h-6 w-14 rounded" />
            <Bone className="h-6 w-6 rounded" />
            <Bone className="h-5 w-28 ml-2" />
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="min-w-[700px] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Bone key={i} className="h-3 w-8" />
              ))}
            </div>
            {/* Calendar cells — 5 rows × 7 cols */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-800">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="p-2.5 min-h-[90px] flex flex-col justify-between">
                  <Bone className="h-5 w-5 rounded-full" />
                  {/* Occasionally show a task bar */}
                  {[2, 8, 15, 22].includes(i) && <Bone className="h-6 w-full rounded-lg mt-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Default export — used for initial page load (Overview tab is default)
══════════════════════════════════════════════════════════════════════════ */
export function ProjectDetailSkeleton() {
  return (
    <SkeletonShell activeTabIndex={0} noShell={false}>
      <div className="flex-1 p-6 space-y-4">
        <Bone className="h-6 w-1/4" />
        <Bone className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Bone className="h-24 w-full" />
          <Bone className="h-24 w-full" />
          <Bone className="h-24 w-full" />
        </div>
      </div>
    </SkeletonShell>
  );
}
