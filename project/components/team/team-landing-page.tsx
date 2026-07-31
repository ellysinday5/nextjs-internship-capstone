"use client"

import { useRef, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import { ListTodo, Activity, Users2, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

interface TeamLandingProps {
  onBrowsePeople: () => void
  onCreateTeam: () => void
}

const FEATURE_CARDS = [
  {
    title: "Team priorities, at a glance",
    description: "See what each team member is focused on and what's next on their list.",
    icon: ListTodo,
    accent: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
    bar: "bg-violet-200 dark:bg-violet-800/50",
  },
  {
    title: "Comprehensive capacity views",
    description: "Monitor your team's workload, project timelines, and progress in one place.",
    icon: BarChart3,
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    bar: "bg-blue-200 dark:bg-blue-800/50",
  },
  {
    title: "Real-time activity feed",
    description: "Stay updated with live activity across your workspace and never miss a beat.",
    icon: Activity,
    accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
    bar: "bg-emerald-200 dark:bg-emerald-800/50",
  },
  {
    title: "Built for collaboration",
    description: "Bring devs, designers, and PMs together under one shared workflow.",
    icon: Users2,
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
    bar: "bg-amber-200 dark:bg-amber-800/50",
  },
]

function FeatureMockup({ icon: Icon, accent, bar }: (typeof FEATURE_CARDS)[number]) {
  return (
    <div className="flex h-36 w-full flex-col justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
      <div className="space-y-2">
        <div className={`h-7 w-7 rounded-lg ${accent} flex items-center justify-center`}>
          <Icon size={15} />
        </div>
        <div className={`h-2.5 w-4/5 rounded-full ${bar}`} />
        <div className={`h-2.5 w-3/5 rounded-full ${bar}`} />
      </div>
      <div className="flex -space-x-2">
        <div className="h-6 w-6 rounded-full border-2 border-slate-50 bg-slate-300 dark:border-slate-800 dark:bg-slate-600" />
        <div className="h-6 w-6 rounded-full border-2 border-slate-50 bg-slate-400 dark:border-slate-800 dark:bg-slate-500" />
      </div>
    </div>
  )
}

// Decorative "loading" skeleton cards for the background layer
function SkeletonCardRow({ count, className = "" }: { count: number; className?: string }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

export function TeamLanding({ onBrowsePeople, onCreateTeam }: TeamLandingProps) {
  const [api, setApi] = useState<CarouselApi>()
  const autoplay = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  return (
    <div className="relative flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Background decorative skeleton layer — implies content is "loading" behind the hero */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-4 p-8 opacity-60">
        <SkeletonCardRow count={7} />
        <SkeletonCardRow count={7} />
        <SkeletonCardRow count={7} />
      </div>

      {/* Foreground hero content — vertically centered within the available space */}
      <div className="relative flex flex-1 items-center px-6 py-14 sm:px-10 lg:px-14">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text column */}
          <div className="rounded-2xl bg-white/95 text-center backdrop-blur-sm dark:bg-slate-900/95 lg:text-left">
            <h1 className="text-5xl font-extrabold leading-[1.05] text-[#142843] dark:text-white sm:text-6xl lg:text-7xl">
              Align teams and visualize their work!
            </h1>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400">
              Use Teams Hub to coordinate teams, organize priorities, and understand
              the details of their work.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button
                onClick={onBrowsePeople}
                className="rounded-lg bg-[#142843] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f1f35]"
              >
                Browse People
              </button>
              <button
                onClick={onCreateTeam}
                className="rounded-lg border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Create Team
              </button>
            </div>
          </div>

          {/* Carousel column */}
          <div className="w-full">
            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={[autoplay.current]}
              setApi={setApi}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {FEATURE_CARDS.map((card, index) => (
                  <CarouselItem key={index} className="basis-4/5 pl-4 sm:basis-1/2">
                    <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900">
                      <FeatureMockup {...card} />
                      <div>
                        <h3 className="text-sm font-bold text-[#142843] dark:text-white">
                          {card.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="mt-5 flex items-center justify-center gap-4 lg:justify-start">
              <button
                onClick={() => api?.scrollPrev()}
                aria-label="Previous"
                className="text-slate-400 transition-colors hover:text-[#142843] dark:hover:text-white"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                aria-label="Next"
                className="text-slate-400 transition-colors hover:text-[#142843] dark:hover:text-white"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}