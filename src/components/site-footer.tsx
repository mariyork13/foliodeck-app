import Link from "next/link";
import { LanguageToggle } from "./language-toggle";

export function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto max-w-[1920px] px-4">
        <div className="border-t border-white/10" />
        <div className="flex flex-col gap-4 pb-6 pt-6 text-sm text-white sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; Foliodeck</span>
          <nav className="flex flex-col gap-2 text-white/60 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/privacy-policy" className="hover:text-white">
              Политика обработки персональных данных
            </Link>
            <Link href="/data-distribution-consent" className="hover:text-white">
              Согласие на распространение персональных данных
            </Link>
            <LanguageToggle />
          </nav>
          <span>2026</span>
        </div>
      </div>
    </footer>
  );
}
