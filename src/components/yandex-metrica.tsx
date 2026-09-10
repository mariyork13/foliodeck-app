"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useConsent } from "@/lib/consent-context";

// Loads Yandex Metrica only after the visitor accepts analytics cookies, and
// only if a counter id is configured. Webvisor (session recording) is off — the
// portfolio-submission form contains personal data. Click and scroll maps are on.
const COUNTER_ID = process.env.NEXT_PUBLIC_YM_COUNTER_ID;

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number };
  }
}

export function YandexMetrica() {
  const { consent } = useConsent();
  const pathname = usePathname();
  const ready = useRef(false);

  useEffect(() => {
    if (!COUNTER_ID || consent !== "all" || ready.current) return;
    if (document.querySelector('script[src="https://mc.yandex.ru/metrika/tag.js"]')) {
      ready.current = true;
      return;
    }

    window.ym =
      window.ym ||
      function (...args: unknown[]) {
        (window.ym!.a = window.ym!.a || []).push(args);
      };
    window.ym.l = Date.now();

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.appendChild(s);

    window.ym(Number(COUNTER_ID), "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
      defer: true, // we send every page view ourselves, incl. SPA navigations
    });
    ready.current = true;
  }, [consent]);

  useEffect(() => {
    if (!COUNTER_ID || consent !== "all" || !ready.current || !window.ym) return;
    window.ym(Number(COUNTER_ID), "hit", window.location.href);
  }, [pathname, consent]);

  return null;
}
