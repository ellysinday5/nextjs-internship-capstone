"use client"

import { useEffect, useState } from "react"

/* ─────────────────────────────────────────────
   Unified Auth Illustration
   Used on BOTH /sign-in and /sign-up

   Sequence:
   1. Rocket flies up into frame and settles (top-right)
   2. Once it lands, the gear + calendar scene fades/slides in (bottom area)
   3. Everything then continues on independent idle loops
      (rocket bob, flame flicker, fin sway, gear spin, calendar float)
───────────────────────────────────────────── */
export function AuthIllustration() {
  const [started, setStarted] = useState(false)
  const [rocketLanded, setRocketLanded] = useState(false)
  const [sceneSettled, setSceneSettled] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setStarted(true), 100)
    const t2 = setTimeout(() => setRocketLanded(true), 100 + 1400)
    const t3 = setTimeout(() => setSceneSettled(true), 100 + 1400 + 800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-slate-100">
      <div className="relative w-[240px] h-[240px]">
        {/* ── Gear (bottom-left) — enters after rocket lands, then idles ── */}
        <div
          className="absolute left-1 bottom-2 w-[110px] h-[110px] text-[#2d3a4e]"
          style={{
            opacity: rocketLanded ? 1 : 0,
            transform: rocketLanded ? "translateY(0px)" : "translateY(24px)",
            transition: "opacity 700ms ease-out, transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className={sceneSettled ? "animate-gear-spin-slow" : ""}>
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full drop-shadow-sm">
              <path d="M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0-10a25 25 0 1 1 0 50 25 25 0 0 1 0-50z" />
              <path d="M46 2h8v12h-8zM46 86h8v12h-8zM2 46h12v8H2zM86 46h12v8H86zM16.05 10.39l8.49 8.49-5.66 5.66-8.48-8.49zM81.12 75.46l8.49 8.49-5.66 5.66-8.49-8.49zM10.39 81.12l8.49-8.49 5.66 5.66-8.49 8.49zM75.46 16.05l8.49-8.49 5.66 5.66-8.49 8.49z" />
            </svg>
          </div>
        </div>

        {/* ── Calendar (bottom-right) — slides in after rocket lands, then idles ── */}
        <div
          className="absolute right-1 bottom-4 w-[135px] h-[125px]"
          style={{
            opacity: rocketLanded ? 1 : 0,
            transform: rocketLanded ? "translateX(0px)" : "translateX(50px)",
            transition: "opacity 700ms ease-out, transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className={sceneSettled ? "animate-calendar-idle" : ""}>
            <svg viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
              <rect x="5" y="15" width="110" height="90" rx="14" fill="#5885af" stroke="#2c3e50" strokeWidth="4" />
              <path d="M5 29C5 21.268 11.268 15 19 15H101C108.732 15 115 21.268 115 29V38H5V29Z" fill="#3b5998" />
              <rect x="30" y="6" width="10" height="20" rx="5" fill="#2c3e50" />
              <rect x="80" y="6" width="10" height="20" rx="5" fill="#2c3e50" />

              <rect x="20" y="48" width="14" height="12" rx="3" fill="#88b04b" className={sceneSettled ? "animate-date-blink" : ""} />
              <rect x="42" y="48" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="64" y="48" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="86" y="48" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />

              <rect x="20" y="68" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="42" y="68" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="64" y="68" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="86" y="68" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />

              <rect x="20" y="88" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="42" y="88" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="64" y="88" width="14" height="12" rx="3" fill="#ffffff" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* ── Rocket — flies up into frame first, lands top-right, then idles ── */}
        <div
          className="absolute right-6 top-2 w-[105px] h-[145px]"
          style={{
            opacity: started ? 1 : 0,
            transform: started ? "translateY(0px) rotate(0deg)" : "translateY(180px) rotate(10deg)",
            transition: "opacity 900ms ease-out, transform 1400ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className={rocketLanded ? "animate-rocket-body" : ""}>
            <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl overflow-visible">
              {/* Flame — always flickering on its own fast cycle */}
              <g className="animate-flame-flicker" style={{ transformOrigin: "60px 115px" }}>
                <path d="M50 115 Q60 155 70 115 Z" fill="#f97316" />
                <path d="M54 115 Q60 145 66 115 Z" fill="#facc15" />
              </g>

              {/* Fins — independent sway, offset from each other */}
              <g className="animate-fin-sway-left" style={{ transformOrigin: "45px 95px" }}>
                <path d="M30 100 L45 75 L45 110 Z" fill="#1e293b" />
              </g>
              <g className="animate-fin-sway-right" style={{ transformOrigin: "75px 95px" }}>
                <path d="M90 100 L75 75 L75 110 Z" fill="#1e293b" />
              </g>

              {/* Body */}
              <path d="M45 45 C45 20 60 5 60 5 C60 5 75 20 75 45 V110 H45 V45 Z" fill="#2d3a4e" />
              <path d="M45 45 C45 20 60 5 60 5 C60 5 75 20 75 45 H45 Z" fill="#475569" />

              {/* Window */}
              <circle cx="60" cy="55" r="10" fill="#38bdf8" stroke="#1e293b" strokeWidth="3" />
              <circle cx="60" cy="55" r="5" fill="#ffffff" opacity="0.8" className="animate-window-glint" />
            </svg>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gearSpinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-gear-spin-slow {
          animation: gearSpinSlow 18s linear infinite;
          transform-origin: 50% 50%;
        }

        @keyframes calendarIdle {
          0% { transform: translateY(0px) rotate(0deg); }
          30% { transform: translateY(-4px) rotate(-0.6deg); }
          60% { transform: translateY(1px) rotate(0.4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-calendar-idle {
          animation: calendarIdle 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        @keyframes dateBlink {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.45; }
        }
        .animate-date-blink {
          animation: dateBlink 2.8s ease-in-out infinite;
        }

        @keyframes rocketBody {
          0%   { transform: translateY(0px) rotate(0deg); }
          35%  { transform: translateY(-6px) rotate(1.4deg); }
          70%  { transform: translateY(3px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-rocket-body {
          animation: rocketBody 3.4s cubic-bezier(0.37, 0, 0.63, 1) infinite;
        }

        @keyframes finSwayLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-3deg); }
        }
        @keyframes finSwayRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-fin-sway-left {
          animation: finSwayLeft 2.1s ease-in-out infinite;
        }
        .animate-fin-sway-right {
          animation: finSwayRight 1.8s ease-in-out infinite;
        }

        @keyframes flameFlicker {
          0%   { transform: scaleY(1) scaleX(1); opacity: 1; }
          20%  { transform: scaleY(1.15) scaleX(0.92); opacity: 0.9; }
          40%  { transform: scaleY(0.9) scaleX(1.05); opacity: 1; }
          60%  { transform: scaleY(1.2) scaleX(0.95); opacity: 0.85; }
          80%  { transform: scaleY(0.95) scaleX(1); opacity: 1; }
          100% { transform: scaleY(1) scaleX(1); opacity: 1; }
        }
        .animate-flame-flicker {
          animation: flameFlicker 0.6s ease-in-out infinite;
        }

        @keyframes windowGlint {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        .animate-window-glint {
          animation: windowGlint 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}