"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useConsent } from "@/lib/consent-context";
import { useInMetricaPlayer } from "@/lib/metrica-player";

// Loads Yandex Metrica only after the visitor accepts analytics cookies, and
// only if a counter id is configured. Webvisor (session recording), click and
// scroll maps are on; the portfolio-submission form is masked from Webvisor
// (ym-hide-content / ym-disable-keys in submit-modal.tsx).
const COUNTER_ID = process.env.NEXT_PUBLIC_YM_COUNTER_ID;

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number };
  }
}

export function YandexMetrica() {
  const { consent } = useConsent();
  const inPlayer = useInMetricaPlayer();
  const allowed = consent === "all" || inPlayer;
  const pathname = usePathname();
  const ready = useRef(false);

  useEffect(() => {
    if (!COUNTER_ID || !allowed || ready.current) return;
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
      webvisor: true,
      defer: true, // we send every page view ourselves, incl. SPA navigations
    });
    ready.current = true;
  }, [allowed]);

  useEffect(() => {
    if (!COUNTER_ID || !allowed || !ready.current || !window.ym) return;
    window.ym(Number(COUNTER_ID), "hit", window.location.href);
  }, [pathname, allowed]);

  return null;
}
