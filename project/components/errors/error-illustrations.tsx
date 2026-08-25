"use client";

import React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Inline SVG illustrations for each SyntraFlow error state.
   All illustrations use only brand palette:
     primary-dark  #0033a0
     primary       #0052cc
     accent-light  #4d8fff
     white         #ffffff
   No external images — fully self-contained SVG.
───────────────────────────────────────────────────────────────────────────── */

interface IllustrationProps {
  className?: string;
}

// ── 404 Not Found ─────────────────────────────────────────────────────────────
// A floating folder with a magnifying glass and a question mark inside.
export function NotFoundIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 128 128" fill="none" className={className} aria-hidden="true">
      {/* Glow ring */}
      <circle cx="56" cy="72" r="44" fill="#0033a0" fillOpacity="0.18" />

      {/* Folder back panel */}
      <rect x="14" y="46" width="70" height="52" rx="7" fill="#0052cc" fillOpacity="0.55" />
      {/* Folder tab */}
      <path d="M14 46 L14 40 Q14 34 20 34 L40 34 Q46 34 48 40 L54 46 Z" fill="#0052cc" fillOpacity="0.75" />
      {/* Folder body */}
      <rect x="18" y="52" width="62" height="42" rx="5" fill="#0033a0" />

      {/* Question mark */}
      <text
        x="49"
        y="79"
        fontFamily="ui-monospace, monospace"
        fontSize="22"
        fontWeight="800"
        fill="white"
        fillOpacity="0.85"
        textAnchor="middle"
      >
        ?
      </text>

      {/* Magnifying glass circle */}
      <circle cx="90" cy="40" r="16" fill="#0a1f5c" stroke="#4d8fff" strokeWidth="3.5" />
      {/* Magnifying glass inner */}
      <circle cx="90" cy="40" r="10" fill="#0033a0" fillOpacity="0.4" />
      {/* Magnifying glass handle */}
      <line
        x1="101"
        y1="51"
        x2="112"
        y2="62"
        stroke="#4d8fff"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Sparkle dots */}
      <circle cx="18" cy="38" r="2.5" fill="#4d8fff" fillOpacity="0.6" />
      <circle cx="110" cy="24" r="2" fill="#4d8fff" fillOpacity="0.4" />
      <circle cx="106" cy="78" r="1.5" fill="#4d8fff" fillOpacity="0.35" />
    </svg>
  );
}

// ── 500 Runtime Error ──────────────────────────────────────────────────────────
// A hexagonal circuit node with a lightning bolt through it.
export function RuntimeErrorIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 128 128" fill="none" className={className} aria-hidden="true">
      {/* Glow */}
      <circle cx="64" cy="64" r="46" fill="#0033a0" fillOpacity="0.15" />

      {/* Hexagon */}
      <polygon
        points="64,16 100,36 100,76 64,96 28,76 28,36"
        fill="#0033a0"
        stroke="#4d8fff"
        strokeWidth="2.5"
        strokeOpacity="0.7"
      />
      {/* Inner hex glow */}
      <polygon
        points="64,26 90,41 90,71 64,86 38,71 38,41"
        fill="#001f6b"
        fillOpacity="0.6"
      />

      {/* Circuit lines */}
      <line x1="28" y1="56" x2="12" y2="56" stroke="#4d8fff" strokeWidth="2" strokeOpacity="0.5" />
      <line x1="100" y1="56" x2="116" y2="56" stroke="#4d8fff" strokeWidth="2" strokeOpacity="0.5" />
      <line x1="46" y1="26" x2="36" y2="10" stroke="#4d8fff" strokeWidth="2" strokeOpacity="0.5" />
      <line x1="82" y1="26" x2="92" y2="10" stroke="#4d8fff" strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="12" cy="56" r="3" fill="#4d8fff" fillOpacity="0.6" />
      <circle cx="116" cy="56" r="3" fill="#4d8fff" fillOpacity="0.6" />
      <circle cx="36" cy="10" r="3" fill="#4d8fff" fillOpacity="0.6" />
      <circle cx="92" cy="10" r="3" fill="#4d8fff" fillOpacity="0.6" />

      {/* Lightning bolt */}
      <path
        d="M70 30 L56 60 L66 60 L58 96 L76 54 L64 54 Z"
        fill="#fbbf24"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── 403 Forbidden ─────────────────────────────────────────────────────────────
// A shield with a padlock inside.
export function ForbiddenIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 128 128" fill="none" className={className} aria-hidden="true">
      {/* Glow */}
      <circle cx="64" cy="68" r="44" fill="#0033a0" fillOpacity="0.15" />

      {/* Shield */}
      <path
        d="M64 16 L100 32 L100 68 Q100 94 64 112 Q28 94 28 68 L28 32 Z"
        fill="#0033a0"
        stroke="#4d8fff"
        strokeWidth="2.5"
        strokeOpacity="0.6"
      />
      {/* Shield inner */}
      <path
        d="M64 26 L92 40 L92 68 Q92 88 64 102 Q36 88 36 68 L36 40 Z"
        fill="#001a6b"
        fillOpacity="0.7"
      />

      {/* Lock body */}
      <rect x="50" y="64" width="28" height="22" rx="4" fill="#4d8fff" fillOpacity="0.9" />
      {/* Lock shackle */}
      <path
        d="M56 64 L56 56 Q56 48 64 48 Q72 48 72 56 L72 64"
        stroke="#4d8fff"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.9"
      />
      {/* Lock keyhole */}
      <circle cx="64" cy="73" r="3.5" fill="#0033a0" />
      <rect x="62" y="73" width="4" height="7" rx="1" fill="#0033a0" />
    </svg>
  );
}

// ── Offline ────────────────────────────────────────────────────────────────────
// Wifi signal icon with a broken/crossed wave.
export function OfflineIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 128 128" fill="none" className={className} aria-hidden="true">
      {/* Glow */}
      <circle cx="64" cy="64" r="44" fill="#0033a0" fillOpacity="0.15" />

      {/* Outer wifi arc - faded */}
      <path
        d="M20 62 Q64 16 108 62"
        stroke="#4d8fff"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.25"
      />
      {/* Middle wifi arc - faded */}
      <path
        d="M34 72 Q64 38 94 72"
        stroke="#4d8fff"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.3"
      />
      {/* Inner wifi arc */}
      <path
        d="M46 82 Q64 62 82 82"
        stroke="#4d8fff"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.5"
      />
      {/* Dot */}
      <circle cx="64" cy="96" r="5" fill="#4d8fff" fillOpacity="0.5" />

      {/* X slash overlay */}
      <line x1="38" y1="40" x2="90" y2="92" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
      <line x1="90" y1="40" x2="38" y2="92" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// ── Invalid Invite ─────────────────────────────────────────────────────────────
// An envelope with a broken link / X seal.
export function InvalidInviteIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 128 128" fill="none" className={className} aria-hidden="true">
      {/* Glow */}
      <circle cx="64" cy="64" r="44" fill="#0033a0" fillOpacity="0.15" />

      {/* Envelope body */}
      <rect x="18" y="38" width="88" height="60" rx="8" fill="#0033a0" />
      {/* Envelope flap */}
      <path d="M18 38 L64 72 L110 38 Z" fill="#0052cc" />
      {/* Envelope bottom fold line */}
      <path d="M18 98 L50 72" stroke="#4d8fff" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M110 98 L78 72" stroke="#4d8fff" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Red X badge */}
      <circle cx="96" cy="36" r="18" fill="#1e3a8a" />
      <circle cx="96" cy="36" r="14" fill="#dc2626" />
      <line x1="89" y1="29" x2="103" y2="43" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="103" y1="29" x2="89" y2="43" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Maintenance / Server Error ──────────────────────────────────────────────────
// A server stack with a wrench overlaid.
export function MaintenanceIllustration({ className = "w-32 h-32" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 128 128" fill="none" className={className} aria-hidden="true">
      {/* Glow */}
      <circle cx="64" cy="64" r="44" fill="#0033a0" fillOpacity="0.15" />

      {/* Server racks */}
      <rect x="22" y="30" width="70" height="18" rx="5" fill="#0033a0" />
      <rect x="22" y="54" width="70" height="18" rx="5" fill="#0033a0" strokeOpacity="0.5" />
      <rect x="22" y="78" width="70" height="18" rx="5" fill="#0033a0" />

      {/* Server lights */}
      <circle cx="82" cy="39" r="3" fill="#22c55e" />
      <circle cx="74" cy="39" r="3" fill="#22c55e" fillOpacity="0.5" />
      <circle cx="82" cy="63" r="3" fill="#fbbf24" />
      <circle cx="74" cy="63" r="3" fill="#fbbf24" fillOpacity="0.5" />
      <circle cx="82" cy="87" r="3" fill="#ef4444" />
      <circle cx="74" cy="87" r="3" fill="#ef4444" fillOpacity="0.5" />

      {/* Server slots */}
      <rect x="30" y="36" width="30" height="6" rx="2" fill="#001f6b" fillOpacity="0.8" />
      <rect x="30" y="60" width="30" height="6" rx="2" fill="#001f6b" fillOpacity="0.8" />
      <rect x="30" y="84" width="30" height="6" rx="2" fill="#001f6b" fillOpacity="0.8" />

      {/* Wrench */}
      <g transform="translate(72, 62) rotate(45)">
        <rect x="-4" y="-22" width="8" height="36" rx="2" fill="#f59e0b" />
        <rect x="-8" y="-24" width="16" height="8" rx="3" fill="#f59e0b" />
        <rect x="-8" y="10" width="16" height="8" rx="3" fill="#f59e0b" />
      </g>
    </svg>
  );
}
