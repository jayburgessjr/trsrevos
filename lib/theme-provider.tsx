"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

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
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const stored = window.localStorage.getItem(storageKey) as Theme | null
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored)
      } else {
        setThemeState(defaultTheme)
      }
    } catch (error) {
      console.warn("Unable to read stored theme preference:", error)
      setThemeState(defaultTheme)
    } finally {
      setMounted(true)
    }
  }, [storageKey, defaultTheme])

  useEffect(() => {
    if (!mounted || typeof window === "undefined") {
      return
    }

    const root = window.document.documentElement
    const resolveTheme = (): ResolvedTheme => {
      if (theme === "system") {
        if (typeof window.matchMedia === "function") {
          return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        }
        return "light"
      }
      return theme
    }

    const applyTheme = (nextTheme: ResolvedTheme) => {
      setResolvedTheme(nextTheme)
      root.setAttribute("data-theme", nextTheme)
      root.classList.remove("light", "dark")
      root.classList.add(nextTheme)
      root.style.colorScheme = nextTheme
    }

    const effectiveTheme = resolveTheme()
    applyTheme(effectiveTheme)

    if (theme !== "system" || typeof window.matchMedia !== "function") {
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (event: MediaQueryListEvent) => {
      applyTheme(event.matches ? "dark" : "light")
    }

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }

    if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }

    return undefined
  }, [theme, mounted])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (newTheme: Theme) => {
        setThemeState(newTheme)

        if (typeof window === "undefined") {
          return
        }

        try {
          window.localStorage.setItem(storageKey, newTheme)
        } catch (error) {
          console.warn("Unable to persist theme preference:", error)
        }
      },
    }),
    [theme, resolvedTheme, storageKey],
  )

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
