"use client";

import { useLanguage, type Language } from "@/lib/language-context";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/5 p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            language === option.value ? "bg-white text-black" : "text-white/50 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
