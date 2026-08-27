"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 200;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/[0.04] bg-[#26262B]/70 text-white backdrop-blur-[74px] transition-colors hover:bg-[#4D4D55]/70"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
