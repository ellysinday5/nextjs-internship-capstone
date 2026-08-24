"use client";

import { Check } from "lucide-react";
import type React from "react";

interface FilterDropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (val: string) => void;
}

/* Compact filter dropdown button with rich hover effects */
export function FilterDropdown({
  label,
  icon,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: FilterDropdownProps) {
  const isActive = value !== "All";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center justify-between gap-1.5 px-3.5 py-2 min-w-[96px] rounded-xl border-2 text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${
          isActive
            ? "border-[#142843] bg-[#142843] text-white dark:border-[#00b4d8] dark:bg-[#00b4d8] dark:text-[#08131f]"
            : "border-[#142843]/70 dark:border-slate-500 text-[#142843] dark:text-slate-100 bg-white dark:bg-[#14263e] hover:border-[#00b4d8] hover:bg-slate-50 dark:hover:bg-[#1c304a] hover:text-[#00b4d8] dark:hover:text-[#00b4d8]"
        }`}
        suppressHydrationWarning
      >
        <span className="truncate max-w-[110px]">{isActive ? value : label}</span>
        <span className="transition-transform duration-200 shrink-0">{icon}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 z-30 animate-in fade-in-50 zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(opt)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-left rounded-lg transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#00b4d8]/15 text-[#00b4d8] font-extrabold"
                    : "text-[#142843] dark:text-slate-100 hover:bg-[#00b4d8]/10 dark:hover:bg-[#00b4d8]/20 hover:text-[#00b4d8] dark:hover:text-[#00b4d8] hover:translate-x-1"
                }`}
                suppressHydrationWarning
              >
                <span className="truncate">{opt === "All" ? `All ${label}s` : opt}</span>
                {isSelected && <Check size={14} className="text-[#00b4d8] shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
