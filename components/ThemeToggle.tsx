'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { Button } from '@/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    // Cycle through: light -> dark -> system -> light
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getAriaLabel = () => {
    if (theme === "system") {
      return `Using system theme (${resolvedTheme}). Click to switch to light mode.`
    }
    return `Current theme: ${theme}. Click to switch.`
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={getAriaLabel()}
      className="h-9 w-9 relative"
      title={theme === "system" ? `System (${resolvedTheme})` : theme}
    >
      {/* Sun icon for light mode */}
      <Sun
        className="h-4 w-4 rotate-0 scale-100 transition-all duration-200 absolute inset-0 m-auto dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />

      {/* Moon icon for dark mode */}
      <Moon
        className="h-4 w-4 rotate-90 scale-0 transition-all duration-200 absolute inset-0 m-auto dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />

      {/* System indicator (small dot when on system mode) */}
      {theme === "system" && (
        <span
          className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-primary"
          aria-label="Using system theme"
        />
      )}
    </Button>
  )
}
