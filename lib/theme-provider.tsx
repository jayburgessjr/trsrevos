"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "trs-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true)

    const stored = localStorage.getItem(storageKey) as Theme | null
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored)
    } else {
      setTheme(defaultTheme)
    }
  }, [storageKey, defaultTheme])

  // Handle system preference changes and apply theme to HTML
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Determine the actual theme to apply
    let effectiveTheme: ResolvedTheme

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      effectiveTheme = systemTheme
    } else {
      effectiveTheme = theme
    }

    // Update resolved theme state
    setResolvedTheme(effectiveTheme)

    // Apply theme to HTML element via data attribute
    root.setAttribute("data-theme", effectiveTheme)

    // Also set class for Tailwind dark: variants (belt and suspenders)
    root.classList.remove("light", "dark")
    root.classList.add(effectiveTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const newTheme = e.matches ? "dark" : "light"
        setResolvedTheme(newTheme)
        root.setAttribute("data-theme", newTheme)
        root.classList.remove("light", "dark")
        root.classList.add(newTheme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, mounted])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
