"use client"

import { useEffect, useMemo, useState } from "react"

import { useTheme } from "@/lib/theme-provider"
import { cn } from "@/lib/utils"

const ACCENT_STORAGE_KEY = "trs-accent-color"

type ThemeCardProps = {
  className?: string
}

export function ThemeCard({ className }: ThemeCardProps) {
  const { theme, setTheme } = useTheme()
  const [accent, setAccent] = useState("#2563eb")

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY)
      if (stored) {
        setAccent(stored)
        document.documentElement.style.setProperty("--color-accent", stored)
        return
      }

      const current = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
      if (current) {
        setAccent(current.trim())
      }
    } catch (error) {
      console.warn("Unable to load accent color preference:", error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    document.documentElement.style.setProperty("--color-accent", accent)
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, accent)
    } catch (error) {
      console.warn("Unable to persist accent color preference:", error)
    }
  }, [accent])

  const previewGradient = useMemo(
    () =>
      theme === "dark"
        ? `linear-gradient(135deg, ${accent}, rgba(255,255,255,0.08))`
        : `linear-gradient(135deg, ${accent}, rgba(0,0,0,0.05))`,
    [accent, theme],
  )

  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Appearance</h3>
        <div className="text-xs text-gray-500">
          Configure global theme, accent palette, and preview the live application shell.
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Mode</span>
            <div className="flex w-fit rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-1">
              <ModeButton label="Light" active={theme === "light"} onClick={() => setTheme("light")} />
              <ModeButton label="Dark" active={theme === "dark"} onClick={() => setTheme("dark")} />
              <ModeButton label="System" active={false} disabled aria-disabled>
                Soon
              </ModeButton>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Accent Color
            </span>
            <div className="flex items-center gap-3">
              <input
                aria-label="Accent color"
                type="color"
                className="h-11 w-20 cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
              />
              <span className="rounded-md border border-dashed border-[var(--color-border)] px-2 py-1 text-xs font-medium text-gray-600">
                {accent.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Accent updates apply instantly using CSS variables and persist for the current device.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Preview</p>
              <p className="text-sm text-[var(--color-text)]">Settings Control Center</p>
            </div>

            <div
              className={cn(
                "rounded-lg border border-[var(--color-border)] p-4 transition-all",
                theme === "dark" ? "bg-[#1e1e1e]" : "bg-white",
              )}
            >
              <div
                className="h-20 w-full rounded-md"
                style={{
                  background: previewGradient,
                }}
              />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-3/4 rounded-full bg-[var(--color-border)]" />
                <div className="h-3 w-1/2 rounded-full bg-[var(--color-border)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <PreviewPill heading="Text" value={theme === "dark" ? "#F5F5F5" : "#111827"} />
              <PreviewPill heading="Surface" value={theme === "dark" ? "#1E1E1E" : "#F9F9F9"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type ModeButtonProps = {
  label: string
  active: boolean
  onClick?: () => void
  disabled?: boolean
  children?: React.ReactNode
}

function ModeButton({ label, active, onClick, disabled, children }: ModeButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-w-[80px] items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors",
        active
          ? "bg-[var(--color-text)] text-[var(--color-bg)]"
          : "text-gray-600 hover:bg-gray-100",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
      {children ? <span className="ml-1 text-[10px] uppercase text-gray-500">{children}</span> : null}
    </button>
  )
}

function PreviewPill({ heading, value }: { heading: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{heading}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  )
}
