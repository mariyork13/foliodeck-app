"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "foliodeck-subscribe-banner-dismissed";
const panelBg = "bg-[#26262B]/70 backdrop-blur-[74px]";

export function SubscribeBanner() {
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

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center">
      <div className="pointer-events-auto w-fit">
        <div className="mb-1 flex justify-end">
          <button
            onClick={close}
            aria-label="Dismiss"
            className={`flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white ${panelBg}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={`flex items-center gap-3 rounded-xl p-3 ${panelBg}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://static.tildacdn.com/tild3939-3230-4133-a265-376135363534/avatar.png"
            alt="Design Awesome channel"
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
          <p className="whitespace-nowrap text-base font-medium text-white">Channel about portfolio and career</p>
          <a
            href="https://t.me/design_awesome"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 shrink-0 items-center gap-2 rounded-full bg-white pl-3 pr-4 text-base font-medium text-black hover:bg-white/90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.05 2.93a1.5 1.5 0 0 0-1.57-.23L2.6 9.7a1.4 1.4 0 0 0 .12 2.63l4.3 1.42 1.7 5.36a1.3 1.3 0 0 0 2.14.5l2.4-2.3 4.3 3.2a1.4 1.4 0 0 0 2.24-.85l2.8-14.6a1.5 1.5 0 0 0-.55-1.53Zm-3.4 3.3-8.1 7.32-.3 3.1-1.4-4.4 9.8-6.02Z" />
            </svg>
            Subscribe
          </a>
        </div>
      </div>
    </div>
  );
}
