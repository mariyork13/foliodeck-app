"use client";

import Link from "next/link";
import { useConsent } from "@/lib/consent-context";
import { useLanguage } from "@/lib/language-context";

const panelBg = "bg-[#26262B]/70 backdrop-blur-[74px]";

// When a Metrica counter is configured the banner asks for analytics consent;
// otherwise it's just an informational note about necessary cookies.
const ANALYTICS_ENABLED = Boolean(process.env.NEXT_PUBLIC_YM_COUNTER_ID);

const T = {
  en: {
    analytics: (
      <>
        We use necessary cookies to keep the site working, and Yandex Metrica for
        anonymous traffic statistics. See the{" "}
        <Link href="/privacy-policy" className="underline hover:text-white">
          Privacy Policy
        </Link>
        .
      </>
    ),
    necessaryOnly: "We use only technically necessary cookies to keep the site working.",
    accept: "Accept",
    reject: "Only necessary",
    gotIt: "Got it",
  },
  ru: {
    analytics: (
      <>
        Мы используем необходимые cookie для работы сайта и Яндекс.Метрику для
        анонимной статистики посещений. Подробнее — в{" "}
        <Link href="/privacy-policy" className="underline hover:text-white">
          Политике конфиденциальности
        </Link>
        .
      </>
    ),
    necessaryOnly: "Мы используем только технически необходимые cookie для работы сайта.",
    accept: "Принять",
    reject: "Только необходимые",
    gotIt: "Понятно",
  },
};

export function CookieBanner() {
  const { consent, accept, reject } = useConsent();
  const { language } = useLanguage();
  const t = T[language === "ru" ? "ru" : "en"];

  if (consent !== "pending") return null;

  if (!ANALYTICS_ENABLED) {
    return (
      <div className={`pointer-events-auto flex w-full items-center gap-4 rounded-xl p-4 sm:w-[420px] ${panelBg}`}>
        <p className="flex-1 text-[13px] leading-relaxed text-white/70">{t.necessaryOnly}</p>
        <button
          onClick={reject}
          className="shrink-0 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-black hover:bg-white/90"
        >
          {t.gotIt}
        </button>
      </div>
    );
  }

  return (
    <div className={`pointer-events-auto flex w-full flex-col gap-3 rounded-xl p-4 sm:w-[440px] ${panelBg}`}>
      <p className="text-[13px] leading-relaxed text-white/70">{t.analytics}</p>
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-black hover:bg-white/90"
        >
          {t.accept}
        </button>
        <button
          onClick={reject}
          className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium text-white hover:bg-white/20"
        >
          {t.reject}
        </button>
      </div>
    </div>
  );
}
