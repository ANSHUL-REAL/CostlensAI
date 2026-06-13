"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 items-center gap-2 border border-line/80 bg-panel/80 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-body transition duration-300 hover:border-brand/40 hover:text-ink"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <SunMedium className="h-4 w-4 text-brand" />
      ) : (
        <MoonStar className="h-4 w-4 text-brand" />
      )}
      <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>
    </button>
  );
}
