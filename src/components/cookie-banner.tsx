"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "foliodeck-cookie-consent";
const panelBg = "bg-[#26262B]/70 backdrop-blur-[74px]";

export function CookieBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  if (dismissed) return null;

  const accept = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className={`pointer-events-auto flex w-full items-center gap-4 rounded-xl p-4 sm:w-[420px] ${panelBg}`}>
      <p className="flex-1 text-[13px] leading-relaxed text-white/70">
        We use cookies to improve the site and analyze how it&apos;s used. By continuing to use the site, you agree
        to this.
      </p>
      <button
        onClick={accept}
        className="shrink-0 rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-black hover:bg-white/90"
      >
        Got it
      </button>
    </div>
  );
}
