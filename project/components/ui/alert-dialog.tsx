"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────────────────────
   AlertDialog – native React implementation
   Mirrors the API surface of the provided @base-ui spec but
   uses zero external UI-library dependencies.
───────────────────────────────────────────────────────────────*/

interface AlertDialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({
  open: false,
  setOpen: () => {},
})

// ── Root ────────────────────────────────────────────────────

interface AlertDialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function AlertDialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      setInternalOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      <div data-slot="alert-dialog">{children}</div>
    </AlertDialogContext.Provider>
  )
}

// ── Trigger ────────────────────────────────────────────────

function AlertDialogTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = React.useContext(AlertDialogContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => setOpen(true),
      ...props,
    })
  }

  return (
    <button
      data-slot="alert-dialog-trigger"
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  )
}

// ── Portal (renders inline for compatibility) ──────────────

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// ── Overlay ────────────────────────────────────────────────

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  const { open } = React.useContext(AlertDialogContext)
  return (
    <div
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200",
        open ? "animate-fade-in" : "animate-fade-out pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

// ── Content ────────────────────────────────────────────────

function AlertDialogContent({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  const { open, setOpen } = React.useContext(AlertDialogContext)

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [setOpen])

  if (!open) return null

  return (
    <>
      <AlertDialogOverlay onClick={() => setOpen(false)} />
      <div
        data-slot="alert-dialog-content"
        data-size={size}
        role="alertdialog"
        aria-modal="true"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-white dark:bg-[#14263e] p-5 text-[#142843] dark:text-white ring-1 ring-[#142843]/10 dark:ring-white/10 shadow-2xl outline-none animate-zoom-in",
          size === "sm" ? "max-w-xs" : "max-w-sm sm:max-w-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

// ── Header ─────────────────────────────────────────────────

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

// ── Footer ─────────────────────────────────────────────────

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-5 -mb-5 flex flex-col-reverse gap-2 rounded-b-xl border-t border-[#142843]/10 dark:border-white/10 bg-slate-50 dark:bg-[#0f1e31] p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

// ── Media (icon block) ─────────────────────────────────────

function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 *:[svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

// ── Title ──────────────────────────────────────────────────

function AlertDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="alert-dialog-title"
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  )
}

// ── Description ────────────────────────────────────────────

function AlertDialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  )
}

// ── Action (confirm button) ────────────────────────────────

function AlertDialogAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="alert-dialog-action"
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#142843] text-white hover:bg-[#1c3457] transition-colors",
        className
      )}
      {...props}
    />
  )
}

// ── Cancel button ──────────────────────────────────────────

function AlertDialogCancel({ className, ...props }: React.ComponentProps<"button">) {
  const { setOpen } = React.useContext(AlertDialogContext)
  return (
    <button
      data-slot="alert-dialog-cancel"
      onClick={() => setOpen(false)}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-[#142843] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
        className
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
