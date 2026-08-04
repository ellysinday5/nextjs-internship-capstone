import React from "react";

export default function ProjectsLoading() {
  return (
    <div className="relative min-h-screen space-y-6 overflow-hidden animate-pulse">
      <div className="relative z-10 space-y-6">
        {/* Header Title & Button Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="h-8 w-44 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-72 sm:w-96 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="h-10 w-36 rounded-xl bg-slate-300 dark:bg-slate-700 self-start sm:self-auto" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-9 min-w-[200px] flex-1 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-20 rounded-xl bg-slate-200 dark:bg-slate-800 ml-auto" />
        </div>

        {/* Project Cards Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14263e]"
            >
              <div className="space-y-4">
                {/* Header tag & title skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                </div>

                <div className="h-6 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3.5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Tags skeleton */}
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Progress bar skeleton */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              {/* Card Footer skeleton */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-3.5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
