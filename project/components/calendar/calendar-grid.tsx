"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface CalendarGridProps {
  currentYear: number;
  currentMonthIndex: number;
  selectedDay: number | null;
  eventDates: Set<number>;
  onSelectDay: (day: number | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
}

export function CalendarGrid({
  currentYear,
  currentMonthIndex,
  selectedDay,
  eventDates,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}: CalendarGridProps) {
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === currentYear && today.getMonth() === currentMonthIndex;

  return (
    <div className="bg-white dark:bg-[#1c304a] rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-extrabold text-[#142843] dark:text-white">
          {monthNames[currentMonthIndex]} {currentYear}
        </span>
        <button
          onClick={onNextMonth}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = isCurrentMonth && today.getDate() === day;
          const isSelected = selectedDay === day;
          const hasEvent = eventDates.has(day);
          return (
            <button
              key={day}
              onClick={() => onSelectDay(isSelected ? null : day)}
              className={`relative flex flex-col items-center justify-center h-9 rounded-xl text-xs font-bold transition-all
                ${isSelected
                  ? "bg-[#0052cc] text-white shadow-sm"
                  : isToday
                  ? "bg-blue-50 dark:bg-blue-950/40 text-[#0052cc]"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`}
            >
              {day}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0052cc]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <button
          onClick={onGoToToday}
          className="text-xs font-bold text-[#0052cc] hover:underline"
        >
          Go to Today
        </button>
      </div>
    </div>
  );
}

// Helper chip showing current date filter
export function SelectedDayChip({
  selectedDay,
  currentMonthIndex,
  currentYear,
  onClear,
}: {
  selectedDay: number;
  currentMonthIndex: number;
  currentYear: number;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-[#0052cc]">
      <CalendarDays size={13} />
      Showing events on {monthNames[currentMonthIndex]} {selectedDay}, {currentYear}
      <button onClick={onClear} className="ml-1 underline text-slate-400 hover:text-slate-600">
        Clear
      </button>
    </div>
  );
}
