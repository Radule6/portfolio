import React, { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

type Theme = "dark" | "light";

const STORAGE_KEY = "radule-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";

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
  );
};

export default ThemeToggle;
