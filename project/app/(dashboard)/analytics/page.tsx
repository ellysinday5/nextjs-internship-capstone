"use client";

import { TrendingUp, BarChart3, Users, Clock } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142843] dark:text-white tracking-tight">
          Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
          Track project performance and team productivity
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#14263e] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group">
          <h3 className="text-base font-extrabold text-[#142843] dark:text-white">
            Projects Velocity
          </h3>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#142843] dark:text-white">
                8.5
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                tasks/week
              </span>
            </div>
            <div className="text-[#142843] dark:text-slate-200 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={28} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#14263e] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group">
          <h3 className="text-base font-extrabold text-[#142843] dark:text-white">
            Team Efficiency
          </h3>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#142843] dark:text-white">
                92%
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                completion rate
              </span>
            </div>
            <div className="text-[#142843] dark:text-slate-200 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 size={28} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#14263e] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group">
          <h3 className="text-base font-extrabold text-[#142843] dark:text-white">
            Active Users
          </h3>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#142843] dark:text-white">
                24
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                this week
              </span>
            </div>
            <div className="text-[#142843] dark:text-slate-200 group-hover:scale-110 transition-transform duration-300">
              <Users size={28} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#14263e] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group">
          <h3 className="text-base font-extrabold text-[#142843] dark:text-white">
            Avg. Task Time
          </h3>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#142843] dark:text-white">
                2.3
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                days
              </span>
            </div>
            <div className="text-[#142843] dark:text-slate-200 group-hover:scale-110 transition-transform duration-300">
              <Clock size={28} className="stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="bg-white dark:bg-[#1a2b42] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between min-h-[340px]">
          <h2 className="text-xl font-extrabold text-[#142843] dark:text-white mb-4">
            Project Progress
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="mb-3 text-[#142843] dark:text-slate-200">
              <BarChart3 size={54} className="mx-auto stroke-[2]" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Chart Component Placeholder
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              TODO: Implement with Chart.js or Recharts
            </p>
          </div>
        </div>

        {/* Team Activity */}
        <div className="bg-white dark:bg-[#1a2b42] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-[#142843] dark:text-white">
              Team Activity
            </h2>
            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#142843] hover:text-white text-xs font-black text-[#142843] dark:text-slate-200 rounded-full transition-all duration-200">
              View All
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="mb-3 text-[#142843] dark:text-slate-200">
              <TrendingUp size={54} className="mx-auto stroke-[2.5]" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Activity Chart Placeholder
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              TODO: Implement activity timeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
