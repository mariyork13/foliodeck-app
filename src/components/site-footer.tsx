"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { LanguageToggle } from "./language-toggle";

const LINKS: { href: string; en: string; ru: string }[] = [
  { href: "/privacy-policy", en: "Privacy Policy", ru: "Политика обработки данных" },
  { href: "/personal-data-consent", en: "Personal Data Consent", ru: "Согласие на обработку данных" },
  {
    href: "/data-distribution-consent",
    en: "Public Disclosure Consent",
    ru: "Согласие на распространение данных",
  },
];

export function SiteFooter() {
  const { language } = useLanguage();

  return (
    <footer>
      <div className="mx-auto max-w-[1920px] px-4">
        <div className="border-t border-white/10" />
        <div className="flex flex-col gap-4 pb-6 pt-6 text-sm text-white sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; Foliodeck</span>
          <nav className="flex flex-col gap-2 text-white/60 sm:flex-row sm:items-center sm:gap-6">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {language === "ru" ? link.ru : link.en}
              </Link>
            ))}
            <LanguageToggle />
          </nav>
          <span>2026</span>
        </div>
      </div>
    </footer>
  );
}
