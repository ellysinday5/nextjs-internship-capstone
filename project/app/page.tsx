"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Hand, Users, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = now
    ? now
        .toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .replace(",", " -")
    : "";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1a2f] flex flex-col">
      <Navbar />

      {/* Date/time strip - right under the navbar, upper right */}
      <div className="w-full bg-white dark:bg-[#0a1a2f] px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div className="container mx-auto flex justify-end">
          <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 tabular-nums">
            {formattedDateTime}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#142843] dark:text-white mb-4 sm:mb-6 leading-tight">
            Manage Projects with Kanban Boards
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 mb-8 sm:mb-10 max-w-xl mx-auto">
            Organize tasks, collaborate with teams, and track progress with our intuitive
            drag-and-drop project management platform.
          </p>

          <div className="flex justify-center mb-12 sm:mb-16">
            <Button asChild size="lg" className="bg-[#142843] text-white hover:bg-[#1c3457]">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 font-semibold">
                Start Managing Projects
                <ChevronRight size={18} />
              </Link>
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-full border-[#142843]/30 dark:border-white/20 text-[#142843] dark:text-white text-xs sm:text-sm font-medium gap-2"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-[#142843]/40 dark:border-white/30">
                <Hand size={12} />
              </span>
              Drag &amp; Drop Boards
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-full border-[#142843]/30 dark:border-white/20 text-[#142843] dark:text-white text-xs sm:text-sm font-medium gap-2"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-[#142843]/40 dark:border-white/30">
                <Users size={12} />
              </span>
              Team Collaboration
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 rounded-full border-[#142843]/30 dark:border-white/20 text-[#142843] dark:text-white text-xs sm:text-sm font-medium gap-2"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-[#142843]/40 dark:border-white/30">
                <CheckCircle2 size={12} />
              </span>
              Task Management
            </Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
