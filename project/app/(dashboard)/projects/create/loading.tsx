import React from "react";

export default function CreateProjectLoading() {
  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 dark:bg-slate-950 animate-pulse flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4">
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 flex-1 items-stretch">
        <div className="lg:col-span-5 space-y-6">
          <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-4">
            <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-11 w-full rounded-lg bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="lg:col-span-7 h-full min-h-[380px] rounded-2xl bg-slate-100 dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-slate-300 dark:bg-slate-700" />
            <div className="h-6 w-48 rounded-lg bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="h-48 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
