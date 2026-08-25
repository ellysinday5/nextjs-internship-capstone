"use client";

import { useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   app/global-error.tsx — Root-level FATAL error boundary.

   ⚠️  IMPORTANT — PRODUCTION ONLY:
   Next.js does NOT trigger global-error.tsx in development mode (`next dev`).
   It only activates in a production build (`next build && next start`).
   To manually verify this component, force a throw in app/layout.tsx, build
   the app, and run the production server. Do NOT report it as broken if it
   doesn't fire during local development.

   Because this boundary REPLACES the entire root layout (including <html> and
   <body>), it must render its own HTML shell. Tailwind's stylesheet may not
   be loaded when this fires (depending on crash severity), so we use
   minimal inline CSS to guarantee brand consistency even in catastrophic
   failure scenarios.
───────────────────────────────────────────────────────────────────────────── */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the full error for debugging — do not remove.
    console.error("[SyntraFlow] Fatal global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong — SyntraFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #060e1f 0%, #0a1628 50%, #0f2347 100%)",
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            {/* SyntraFlow wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#0033a0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8.5L6.5 12L13 4"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>SyntraFlow</span>
            </div>

            {/* Warning icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(0,51,160,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path
                  d="M20 4L37 34H3L20 4Z"
                  fill="rgba(0,51,160,0.6)"
                  stroke="#4d8fff"
                  strokeWidth="2"
                />
                <line x1="20" y1="15" x2="20" y2="24" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="20" cy="29" r="1.5" fill="#fbbf24" />
              </svg>
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ color: "#4d8fff", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" }}>
                Critical Error
              </p>
              <h1 style={{ color: "white", fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
                SyntraFlow crashed
              </h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
                A critical error occurred and the application could not recover. Try reloading the page — if the problem persists, please contact support.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#0033a0",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Reload page
              </button>
              <button
                onClick={() => { window.location.href = "/"; }}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
