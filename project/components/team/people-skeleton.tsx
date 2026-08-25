"use client";

import React from "react";

export function PeopleCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white p-4 text-center dark:bg-slate-900 min-h-[170px] justify-center">
      <div className="mb-3 h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-700/60 shrink-0" />
      <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700/60 mb-1.5" />
      <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700/60" />
    </div>
  );
}

export function PeopleGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PeopleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PeopleTableSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead className="bg-[#142843] text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">User Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {Array.from({ length: count }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-3.5">
                  <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700/60" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700/60" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700/60" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-700/60" />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="ml-auto h-4 w-6 rounded bg-slate-200 dark:bg-slate-700/60" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
