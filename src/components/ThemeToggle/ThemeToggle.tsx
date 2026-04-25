"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { FiSun, FiMoon } from "react-icons/fi"

const ThemeToggle: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"
  const toggle = () => setTheme(isDark ? "light" : "dark")

  if (!mounted) {
    return (
      <button
        type="button"
        className="relative w-9 h-9 flex items-center justify-center rounded-full border border-border text-text-secondary transition-all duration-300"
        aria-label="Toggle theme"
      >
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 flex items-center justify-center rounded-full border border-border hover:border-border-hover text-text-secondary hover:text-text-primary transition-all duration-300"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <span
        className={`absolute transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-75"
        }`}
      >
        <FiMoon className="w-4 h-4" />
      </span>
      <span
        className={`absolute transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDark
            ? "opacity-0 -rotate-90 scale-75"
            : "opacity-100 rotate-0 scale-100"
        }`}
      >
        <FiSun className="w-4 h-4" />
      </span>
    </button>
  )
}

export default ThemeToggle
