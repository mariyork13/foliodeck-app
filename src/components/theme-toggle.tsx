"use client";

import { setTheme, useTheme, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

// Footer segmented control, styled like the RU/EN language toggle next to it.
export function ThemeToggle() {
  const theme = useTheme();

  return (
    <div className="flex w-fit items-center gap-1 self-start rounded-full bg-white/5 p-0.5 sm:self-auto">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            theme === option.value ? "bg-white text-black" : "text-white/50 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Header icon button: shows the theme you'd switch to.
export function ThemeIconButton({ className }: { className?: string }) {
  const theme = useTheme();
  const next: Theme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === "light" ? "Switch to light theme" : "Switch to dark theme"}
      className={className}
    >
      {next === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// Row in the mobile header's hamburger menu: text only, like the nav links above it.
export function ThemeMenuItem() {
  const theme = useTheme();
  const next: Theme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="px-4 py-2.5 text-left text-[13px] font-medium text-white transition-colors hover:bg-white/10"
    >
      {next === "light" ? "Light theme" : "Dark theme"}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
