"use client";

import { useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  type: string;
  date: string;
  rawDate: string; // e.g. '2026-07-25'
}

const initialDeadlines: EventItem[] = [
  {
    id: "1",
    title: "Website Redesign",
    type: "Project Deadline",
    date: "July 25, 2026",
    rawDate: "2026-07-25",
  },
  {
    id: "2",
    title: "Team Meeting",
    type: "Meeting",
    date: "July 26, 2026",
    rawDate: "2026-07-26",
  },
  {
    id: "3",
    title: "Mobile App Launch",
    type: "Milestone",
    date: "July 27, 2026",
    rawDate: "2026-07-27",
  },
  {
    id: "4",
    title: "Capstone Presentation",
    type: "Presentation",
    date: "July 28, 2026",
    rawDate: "2026-07-28",
  },
];

export default function CalendarPage() {
  const [search, setSearch] = useState("");
  const [deadlines, setDeadlines] = useState<EventItem[]>(initialDeadlines);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(6); // 6 = July
  const [selectedDay, setSelectedDay] = useState<number | null>(25);

  // Add Event Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Project Deadline");
  const [newDate, setNewDate] = useState("2026-07-29");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedDate = new Date(newDate);
    const dateFormatted = !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : newDate;

    const newEvent: EventItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      type: newType,
      date: dateFormatted,
      rawDate: newDate,
    };

    setDeadlines((prev) => [...prev, newEvent]);
    setNewTitle("");
    setIsAddModalOpen(false);
  };

  // Filter deadlines by search
  const filteredDeadlines = deadlines.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    item.date.toLowerCase().includes(search.toLowerCase())
  );

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sunday

  return (
    <div className="space-y-6 w-full">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search bar pill */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-5 pr-11 py-2.5 bg-white dark:bg-[#1c304a] border-2 border-[#142843] dark:border-slate-600 rounded-full text-sm font-semibold text-[#142843] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052cc] shadow-xs"
            suppressHydrationWarning
          />
          <Search
            size={19}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#142843] dark:text-slate-300 pointer-events-none stroke-[2.5]"
          />
        </div>

        {/* Add Event Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] shrink-0"
          suppressHydrationWarning
        >
          <Plus size={18} className="stroke-[3]" />
          Add Event
        </button>
      </div>

      {/* Main Grid: Upcoming Deadlines + Calendar Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upcoming Deadlines */}
        <div className="lg:col-span-6 xl:col-span-5 bg-[#f0f7ff] dark:bg-[#182942] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col min-h-[440px]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-[#142843] dark:text-white tracking-tight">
              Upcoming Deadlines
            </h2>
            <button className="px-3.5 py-1 bg-white dark:bg-slate-800 hover:bg-[#142843] hover:text-white text-xs font-black text-[#142843] dark:text-slate-200 rounded-full transition-all duration-200 border border-[#142843]/20 shadow-xs">
              View All
            </button>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {filteredDeadlines.length === 0 ? (
              <div className="py-12 text-center text-slate-600 dark:text-slate-400 font-semibold text-sm">
                No upcoming deadlines found.
              </div>
            ) : (
              filteredDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#e0f2fe] dark:bg-[#1e3a5f] border-2 border-[#142843] dark:border-slate-600 rounded-2xl p-4 flex items-center justify-between shadow-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <h3 className="font-extrabold text-[#142843] dark:text-white text-base truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-[#0052cc] dark:text-sky-300 mt-0.5">
                      {item.type}
                    </p>
                  </div>
                  <span className="text-xs font-black text-[#142843] dark:text-white bg-white/70 dark:bg-slate-800/70 px-3 py-1.5 rounded-full border border-[#142843]/20 dark:border-slate-600 whitespace-nowrap shrink-0">
                    {item.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Calendar Widget */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white dark:bg-[#14263e] border-2 border-[#142843] dark:border-slate-600 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col min-h-[440px]">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-start gap-4 mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-[#142843] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
              aria-label="Previous month"
              suppressHydrationWarning
            >
              <ChevronLeft size={22} className="stroke-[3]" />
            </button>
            <h2 className="text-lg sm:text-xl font-black text-[#142843] dark:text-white min-w-36">
              {monthNames[currentMonthIndex]} {currentYear}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-[#142843] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
              aria-label="Next month"
              suppressHydrationWarning
            >
              <ChevronRight size={22} className="stroke-[3]" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center font-bold text-base sm:text-lg mb-4">
            <span className="text-[#e05244]">Su</span>
            <span className="text-[#38bdf8]">Mo</span>
            <span className="text-[#38bdf8]">Tu</span>
            <span className="text-[#38bdf8]">We</span>
            <span className="text-[#38bdf8]">Th</span>
            <span className="text-[#38bdf8]">Fr</span>
            <span className="text-[#38bdf8]">Sa</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm sm:text-base font-semibold">
            {/* Empty leading slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-10 sm:h-12" />
            ))}

            {/* Days of the Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = selectedDay === dayNum;
              const isSunday = (firstDayOfWeek + idx) % 7 === 0;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-10 sm:h-12 flex items-center justify-center rounded-2xl transition-all duration-200 font-bold ${
                    isSelected
                      ? "bg-[#142843] text-white shadow-md scale-105"
                      : isSunday
                      ? "text-[#e05244] hover:bg-red-50 dark:hover:bg-red-950/30 hover:scale-105"
                      : "text-[#38bdf8] hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:scale-105"
                  }`}
                  suppressHydrationWarning
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14263e] border-2 border-[#142843] dark:border-slate-600 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-xl font-extrabold text-[#142843] dark:text-white flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#0052cc]" />
                Add New Event
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                suppressHydrationWarning
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142843] dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Design Sprint"
                  className="w-full px-4 py-2.5 border-2 border-[#142843]/30 dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white text-sm font-semibold focus:outline-none focus:border-[#0052cc]"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142843] dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                  Event Category
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#142843]/30 dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white text-sm font-semibold focus:outline-none focus:border-[#0052cc]"
                  suppressHydrationWarning
                >
                  <option value="Project Deadline">Project Deadline</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Presentation">Presentation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142843] dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                  Event Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#142843]/30 dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white text-sm font-semibold focus:outline-none focus:border-[#0052cc]"
                  suppressHydrationWarning
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#142843] dark:text-white rounded-xl font-bold text-sm transition-colors"
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0052cc] hover:bg-[#003d99] text-white rounded-xl font-bold text-sm shadow-md transition-colors"
                  suppressHydrationWarning
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
