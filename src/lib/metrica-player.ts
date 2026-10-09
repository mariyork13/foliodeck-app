"use client";

import { useSyncExternalStore } from "react";

// Metrica's click/scroll maps and Webvisor open the site in an iframe on their
// own domain and talk to the counter on the page. Our counter waits for cookie
// consent, which a fresh iframe never has — so inside the player we load it
// unconditionally (the player doesn't record visits) and hide the banner.
const PLAYER_HOST = /(^|\.)(metrika\.yandex\.[a-z.]+|webvisor\.com)$/;

function isInMetricaPlayer(): boolean {
  if (window.self === window.top) return false;
  const origins = [document.referrer, ...Array.from(window.location.ancestorOrigins ?? [])];
  return origins.some((url) => {
    try {
      return PLAYER_HOST.test(new URL(url).hostname);
    } catch {
      return false;
    }
  });
}

const subscribe = () => () => {};

export function useInMetricaPlayer(): boolean {
  return useSyncExternalStore(subscribe, isInMetricaPlayer, () => false);
}
