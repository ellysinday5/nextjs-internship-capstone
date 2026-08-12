"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, BarChart2, ChevronDown, ChevronUp } from "lucide-react"
import type { Team, TeamMember } from "@/lib/team-data"

interface AnalyticsTabProps {
  members: TeamMember[]
  teams: Team[]
}

// ─── Date helpers ───────────────────────────────────────────────────────────

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

// ─── Calendar ───────────────────────────────────────────────────────────────

interface CalendarProps {
  value: Date
  onChange: (d: Date) => void
}

function MiniCalendar({ value, onChange }: CalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(value.getFullYear(), value.getMonth(), 1))

  const today = startOfDay(new Date())

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))

  // Build calendar grid: Sun–Sat rows
  const firstDay = viewDate.getDay() // 0=Sun
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))
  }

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div className="w-44">
      {/* Month header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {formatMonthYear(viewDate)}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronUp size={12} className="text-slate-500 dark:text-slate-400 -rotate-0" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronDown size={12} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            if (!day) return <span key={di} />
            const isSelected = sameDay(day, value)
            const isToday = sameDay(day, today)
            return (
              <button
                key={di}
                type="button"
                onClick={() => onChange(day)}
                className={`
                  aspect-square flex items-center justify-center rounded-full text-[11px] transition-colors
                  ${isSelected
                    ? "bg-violet-600 text-white font-bold"
                    : isToday
                      ? "border border-violet-500 text-violet-600 dark:text-violet-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }
                `}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Date range picker (dropdown) ───────────────────────────────────────────

type Preset = {
  label: string
  getDates: () => { start: Date; end: Date }
}

const PRESETS: Preset[] = [
  { label: "Today", getDates: () => { const t = startOfDay(new Date()); return { start: t, end: t } } },
  { label: "Yesterday", getDates: () => { const y = addDays(startOfDay(new Date()), -1); return { start: y, end: y } } },
  { label: "This week", getDates: () => {
    const t = startOfDay(new Date()); const dow = t.getDay()
    return { start: addDays(t, -dow), end: addDays(t, 6 - dow) }
  }},
  { label: "Last week", getDates: () => {
    const t = startOfDay(new Date()); const dow = t.getDay()
    const startOfThisWeek = addDays(t, -dow)
    return { start: addDays(startOfThisWeek, -7), end: addDays(startOfThisWeek, -1) }
  }},
  { label: "Last 7 days", getDates: () => ({ start: addDays(startOfDay(new Date()), -6), end: startOfDay(new Date()) }) },
  { label: "Last 30 days", getDates: () => ({ start: addDays(startOfDay(new Date()), -29), end: startOfDay(new Date()) }) },
  { label: "This month", getDates: () => {
    const t = new Date(); return { start: new Date(t.getFullYear(), t.getMonth(), 1), end: new Date(t.getFullYear(), t.getMonth() + 1, 0) }
  }},
  { label: "Last month", getDates: () => {
    const t = new Date(); return { start: new Date(t.getFullYear(), t.getMonth() - 1, 1), end: new Date(t.getFullYear(), t.getMonth(), 0) }
  }},
]

interface DateRange {
  start: Date
  end: Date
  label?: string
}

interface DatePickerDropdownProps {
  range: DateRange
  onChange: (r: DateRange) => void
}

function DatePickerDropdown({ range, onChange }: DatePickerDropdownProps) {
  const [open, setOpen] = useState(false)
  const [calStart, setCalStart] = useState<Date>(range.start)
  const [calEnd, setCalEnd] = useState<Date | null>(range.end)
  const [activePreset, setActivePreset] = useState<string | null>(range.label ?? "Today")
  const [pickingEnd, setPickingEnd] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  function applyPreset(p: Preset) {
    const { start, end } = p.getDates()
    setCalStart(start)
    setCalEnd(end)
    setActivePreset(p.label)
    onChange({ start, end, label: p.label })
    setOpen(false)
  }

  function handleCalendarStart(d: Date) {
    setCalStart(d)
    setCalEnd(null)
    setActivePreset(null)
    setPickingEnd(true)
  }

  function handleCalendarEnd(d: Date) {
    if (d < calStart) {
      setCalEnd(calStart)
      setCalStart(d)
    } else {
      setCalEnd(d)
    }
    setActivePreset(null)
    setPickingEnd(false)
  }

  function handleSet() {
    const end = calEnd ?? calStart
    onChange({ start: calStart, end, label: undefined })
    setOpen(false)
  }

  const displayLabel = range.label ?? `${formatDisplayDate(range.start)} – ${formatDisplayDate(range.end)}`

  return (
    <div ref={ref} className="relative inline-block">
      <div
        className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="w-2 h-2 rounded-sm bg-violet-500 shrink-0" />
        {displayLabel}
        {open
          ? <ChevronUp size={12} className="text-slate-400" />
          : <ChevronDown size={12} className="text-slate-400" />
        }
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange({ start: startOfDay(new Date()), end: startOfDay(new Date()), label: "Today" }) }}
          className="ml-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 p-0.5"
        >
          <X size={10} className="text-slate-400" />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 flex shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Preset list */}
          <div className="bg-white dark:bg-[#1e2a3a] w-36 py-1">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className={`w-full text-left px-4 py-1.5 text-xs font-medium transition-colors
                  ${activePreset === p.label
                    ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendar side */}
          <div className="bg-white dark:bg-[#1e2a3a] border-l border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-2">
            {/* Start / End inputs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPickingEnd(false)}
                className={`flex-1 text-center text-xs rounded-lg border px-2 py-1.5 transition-colors
                  ${!pickingEnd
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                    : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                  }`}
              >
                {formatDisplayDate(calStart)}
              </button>
              <button
                type="button"
                onClick={() => setPickingEnd(true)}
                className={`flex-1 text-center text-xs rounded-lg border px-2 py-1.5 transition-colors
                  ${pickingEnd
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                    : "border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-300"
                  }`}
              >
                {calEnd ? formatDisplayDate(calEnd) : "End Date"}
              </button>
            </div>

            <MiniCalendar
              value={pickingEnd ? (calEnd ?? calStart) : calStart}
              onChange={pickingEnd ? handleCalendarEnd : handleCalendarStart}
            />

            <button
              type="button"
              onClick={handleSet}
              className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-1.5 transition-colors"
            >
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Activity bar chart (online count per day in range) ─────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function AVATAR_COLOR(id: string) {
  const colors = [
    "bg-violet-500", "bg-blue-500", "bg-emerald-500",
    "bg-rose-500", "bg-amber-500", "bg-cyan-500", "bg-indigo-500",
  ]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff
  return colors[hash % colors.length]
}

// ─── Main component ──────────────────────────────────────────────────────────

type MemberFilter = "Online" | "Offline"

export function AnalyticsTab({ members, teams: _teams }: AnalyticsTabProps) {
  const today = startOfDay(new Date())

  const [dateRange, setDateRange] = useState<DateRange>({
    start: today,
    end: today,
    label: "Today",
  })
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("Online")
  const [itemTypeOpen, setItemTypeOpen] = useState(false)
  const [itemType, setItemType] = useState<"Tasks" | "Subtasks" | "All">("All")

  const onlineMembers = useMemo(() => members.filter((m) => m.status === "Online"), [members])
  const offlineMembers = useMemo(() => members.filter((m) => m.status === "Offline" || m.status === "Away"), [members])

  const displayedMembers = memberFilter === "Online" ? onlineMembers : offlineMembers

  // Build chart data: for each day in range, derive an "online count"
  const daysInRange = useMemo(() => {
    const days: Date[] = []
    let cur = new Date(dateRange.start)
    while (cur <= dateRange.end) {
      days.push(new Date(cur))
      cur = addDays(cur, 1)
    }
    return days
  }, [dateRange])

  const isToday = sameDay(dateRange.start, today) && sameDay(dateRange.end, today)

  // Chart bars: simulated data for historical ranges, real data for today, influenced by itemType filter
  const chartBars = useMemo(() => {
    return daysInRange.map((d) => {
      const daySeed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
      const x = Math.sin(daySeed) * 10000
      let baseVal = Math.floor((x - Math.floor(x)) * (members.length + 1))

      if (itemType === "Tasks") {
        baseVal = Math.max(1, Math.min(members.length, Math.floor(baseVal * 0.8)))
      } else if (itemType === "Subtasks") {
        baseVal = Math.max(0, Math.min(members.length, Math.floor(baseVal * 0.5)))
      }

      const isCurrentDay = sameDay(d, today)
      let todayVal = onlineMembers.length
      if (isCurrentDay) {
        if (itemType === "Tasks") todayVal = Math.max(1, Math.floor(todayVal * 0.8))
        else if (itemType === "Subtasks") todayVal = Math.max(0, Math.floor(todayVal * 0.5))
      }

      return {
        date: d,
        value: isCurrentDay ? todayVal : Math.max(0, baseVal),
      }
    })
  }, [daysInRange, onlineMembers.length, today, members.length, itemType])

  const maxBar = Math.max(...chartBars.map((b) => b.value), 1)
  const hasData = chartBars.some((b) => b.value > 0)

  // Nav arrows shift the entire range by 1 day
  function prevDay() {
    setDateRange((r) => ({ start: addDays(r.start, -1), end: addDays(r.end, -1), label: undefined }))
  }
  function nextDay() {
    setDateRange((r) => ({ start: addDays(r.start, 1), end: addDays(r.end, 1), label: undefined }))
  }

  return (
    <div className="space-y-0">
      {/* ── Top navigation bar ── */}
      <div className="flex items-center gap-1 py-2 border-b border-slate-200 dark:border-slate-700/60">
        <button
          type="button"
          onClick={prevDay}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={16} className="text-slate-500 dark:text-slate-400" />
        </button>
        <button
          type="button"
          onClick={nextDay}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight size={16} className="text-slate-500 dark:text-slate-400" />
        </button>

        {/* Current date label like "Aug 10" */}
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">
          {formatDisplayDate(dateRange.start)}
        </span>

        <DatePickerDropdown range={dateRange} onChange={setDateRange} />
      </div>

      {/* ── Online count bar chart ── */}
      <div className="border-b border-slate-200 dark:border-slate-700/60 py-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          Number of people who were online
        </p>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-600">
            <div className="relative mb-2">
              <BarChart2 size={48} strokeWidth={1.5} className="text-slate-300 dark:text-slate-600" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500/20 dark:bg-blue-400/20 flex items-center justify-center">
                <span className="text-blue-500 dark:text-blue-400 text-xs font-bold">+</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Not enough data.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-1 h-16 px-1">
              {chartBars.map((bar, i) => {
                const heightPct = (bar.value / maxBar) * 100
                return (
                  <div
                    key={i}
                    className="group flex flex-col items-center justify-end flex-1 h-full gap-0.5"
                    title={`${formatDisplayDate(bar.date)}: ${bar.value} online`}
                  >
                    <div
                      className="w-full max-w-[40px] rounded-t bg-blue-500/70 dark:bg-blue-400/60 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors"
                      style={{ height: `${heightPct}%`, minHeight: bar.value > 0 ? "4px" : "0" }}
                    />
                  </div>
                )
              })}
            </div>
            {/* Date labels under the bars */}
            <div className="flex justify-between px-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500 select-none">
              <span>{formatDisplayDate(dateRange.start)}</span>
              {daysInRange.length > 2 && (
                <span>{formatDisplayDate(daysInRange[Math.floor(daysInRange.length / 2)])}</span>
              )}
              <span>{formatDisplayDate(dateRange.end)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Online / Offline tabs + Item type filter ── */}
      <div className="flex items-center justify-between pt-3 pb-2">
        <div className="flex gap-0">
          <button
            type="button"
            onClick={() => setMemberFilter("Online")}
            className={`px-3 py-1 rounded-l-full text-xs font-semibold border transition-colors
              ${memberFilter === "Online"
                ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-[#142843] dark:text-white shadow-sm"
                : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
          >
            {onlineMembers.length} Online
          </button>
          <button
            type="button"
            onClick={() => setMemberFilter("Offline")}
            className={`px-3 py-1 rounded-r-full text-xs font-semibold border transition-colors
              ${memberFilter === "Offline"
                ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-[#142843] dark:text-white shadow-sm"
                : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
          >
            {offlineMembers.length} Offline
          </button>
        </div>

        {/* Item type dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setItemTypeOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Item type: {itemType}
            <ChevronDown size={13} className="text-slate-400" />
          </button>
          {itemTypeOpen && (
            <div className="absolute right-0 mt-1 z-40 bg-white dark:bg-[#1e2a3a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 w-36">
              {(["Tasks", "Subtasks", "All"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setItemType(t)
                    setItemTypeOpen(false)
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs transition-colors
                    ${itemType === t
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Member cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
        {displayedMembers.length === 0 ? (
          <div className="col-span-full text-sm text-slate-400 dark:text-slate-500 py-8 text-center">
            No {memberFilter.toLowerCase()} members.
          </div>
        ) : (
          displayedMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Time tracker dots ───────────────────────────────────────────────────────

function TimeTrackerDots() {
  const [show, setShow] = useState(false)

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="flex items-center gap-[3px] px-1 py-1 rounded group"
        aria-label="Time spent"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors" />
      </button>

      {show && (
        <div className="absolute bottom-full right-0 mb-2 z-50 pointer-events-none">
          <div className="relative bg-[#1a1a2e] dark:bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-2xl whitespace-nowrap">
            <p className="text-sm font-bold">
              <span className="text-amber-400">Almost no time spent</span>{" "}
              <span className="text-blue-400">in SyntraFlow</span>
            </p>
            {/* Tooltip arrow */}
            <span className="absolute -bottom-1.5 right-4 w-3 h-3 bg-[#1a1a2e] dark:bg-slate-900 rotate-45 rounded-sm" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Member card ─────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: TeamMember }) {
  const STATUS_DOT: Record<TeamMember["status"], string> = {
    Online: "bg-emerald-500",
    Away: "bg-amber-500",
    Offline: "bg-slate-400 dark:bg-slate-500",
  }

  // Generate dynamic, realistic activity text based on member details
  const activityText = useMemo(() => {
    if (member.status === "Online") {
      const activities = [
        "Working on main task board",
        "Refactoring context providers",
        "Reviewing pending pull requests",
        "Updating database schema",
        "Designing dashboard layouts",
      ]
      const idx = member.id.charCodeAt(0) % activities.length
      return activities[idx]
    } else if (member.status === "Away") {
      return "Idle • last active 15m ago"
    } else {
      const hours = (member.id.charCodeAt(0) % 8) + 1
      return `Offline • active ${hours}h ago`
    }
  }, [member.status, member.id])

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#14263e] p-4 flex flex-col gap-3 min-h-[140px] hover:shadow-md transition-shadow duration-200">
      {/* Header: avatar + name + time tracker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${AVATAR_COLOR(member.id)}`}
              >
                {getInitials(member.name)}
              </div>
            )}
            {/* Status dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#14263e] ${STATUS_DOT[member.status]}`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#142843] dark:text-white leading-tight truncate max-w-[120px]">
              {member.name}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
              {member.role}
            </p>
          </div>
        </div>

        <TimeTrackerDots />
      </div>

      {/* Activity area */}
      <div className="flex-1 flex flex-col justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 px-3 py-2 min-h-[60px]">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 select-none">
          Current Activity
        </span>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {activityText}
        </p>
      </div>
    </div>
  )
}
