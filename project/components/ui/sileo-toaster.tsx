"use client"

import React, { useEffect, useState } from "react"
import {
  subscribeToToasts,
  subscribeToSwal,
  ToastItem,
  SwalModalOptions,
} from "@/utils/alerts"
import { Check, X, AlertTriangle, Info, HelpCircle } from "lucide-react"

// Color scheme per variant (Red for error, Green for success)
const variantStyles = {
  error: {
    bg: "bg-[#e54d42]",
    text: "text-[#e54d42]",
    circle: "bg-white/25 text-white",
    icon: X,
  },
  success: {
    bg: "bg-[#10b981]",
    text: "text-[#10b981]",
    circle: "bg-white/25 text-white",
    icon: Check,
  },
  warning: {
    bg: "bg-[#f59e0b]",
    text: "text-[#f59e0b]",
    circle: "bg-white/25 text-white",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-[#2563eb]",
    text: "text-[#2563eb]",
    circle: "bg-white/25 text-white",
    icon: Info,
  },
}

export function SileoToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [activeSwal, setActiveSwal] = useState<SwalModalOptions | null>(null)

  // Listen for toast & swal events
  useEffect(() => {
    const unsubToasts = subscribeToToasts((item) => {
      setToasts((prev) => [...prev, item])

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id))
      }, item.duration || 4000)

      return () => clearTimeout(timer)
    })

    const unsubSwal = subscribeToSwal((swalOptions) => {
      setActiveSwal(swalOptions)
    })

    return () => {
      unsubToasts()
      unsubSwal()
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <>
      {/* ── SILEO TOAST CONTAINER (Top-Right) ── */}
      <div className="fixed top-6 right-6 z-[10000] flex flex-col items-end gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const style = variantStyles[toast.type] || variantStyles.info
          const IconComponent = style.icon

          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              className="pointer-events-auto cursor-pointer flex flex-col items-end max-w-sm sm:max-w-md filter drop-shadow-xl transition-all duration-300 animate-slide-in-from-top hover:scale-[1.02]"
              role="alert"
            >
              {/* Top Badge Tab */}
              <div
                className={`relative flex items-center gap-2 px-4 py-2 rounded-t-2xl ${style.bg} text-white shadow-sm z-10 self-end`}
              >
                {/* Circle Icon Badge */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${style.circle}`}
                >
                  <IconComponent size={12} strokeWidth={3} />
                </div>

                {/* Title */}
                <span className="font-bold text-xs sm:text-sm tracking-wide select-none pr-1">
                  {toast.title}
                </span>

                {/* Smooth Inverted Concave Curve (Fillet) connecting tab to main box */}
                <svg
                  className={`absolute bottom-0 right-full w-4 h-4 ${style.text} pointer-events-none`}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M16 0v16H0a16 16 0 0 0 16-16z" />
                </svg>
              </div>

              {/* Main Description Box */}
              <div
                className={`w-full px-5 py-3.5 rounded-l-2xl rounded-b-2xl ${style.bg} text-white text-sm font-medium leading-relaxed select-none -mt-[0.5px] shadow-lg`}
              >
                {toast.message}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── SWEETALERT2 STYLE MODAL DIALOG ── */}
      {activeSwal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-[#14263e] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 text-center animate-zoom-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Icon */}
            <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-white/10">
              {activeSwal.type === "success" && (
                <Check className="w-8 h-8 text-emerald-500" />
              )}
              {activeSwal.type === "error" && (
                <X className="w-8 h-8 text-red-500" />
              )}
              {activeSwal.type === "warning" && (
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              )}
              {activeSwal.type === "question" && (
                <HelpCircle className="w-8 h-8 text-blue-500" />
              )}
              {activeSwal.type === "loading" && (
                <div className="w-7 h-7 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeSwal.title}
            </h3>

            {/* Text */}
            {activeSwal.text && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {activeSwal.text}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3">
              {activeSwal.showCancelButton && (
                <button
                  onClick={() => {
                    activeSwal.onCancel?.()
                    setActiveSwal(null)
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {activeSwal.cancelButtonText || "Cancel"}
                </button>
              )}

              <button
                onClick={() => {
                  activeSwal.onConfirm?.()
                  setActiveSwal(null)
                }}
                className="px-6 py-2.5 rounded-xl bg-[#142843] dark:bg-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {activeSwal.confirmButtonText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
