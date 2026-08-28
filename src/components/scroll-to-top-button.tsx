"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 200;
const EDGE_GAP = 16; // matches bottom-4 / right-4
const BUTTON_SIZE = 44; // h-11 / w-11
const BANNER_GAP = 12;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(EDGE_GAP);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const recompute = () => {
      const banner = document.getElementById("bottom-banner-stack");
      if (!banner || banner.children.length === 0) {
        setBottomOffset(EDGE_GAP);
        return;
      }
      const bannerRect = banner.getBoundingClientRect();
      const buttonRight = window.innerWidth - EDGE_GAP;
      const buttonLeft = buttonRight - BUTTON_SIZE;
      const buttonBottom = window.innerHeight - EDGE_GAP;
      const buttonTop = buttonBottom - BUTTON_SIZE;
      const overlaps = bannerRect.right > buttonLeft && bannerRect.left < buttonRight && bannerRect.top < buttonBottom && bannerRect.bottom > buttonTop;
      setBottomOffset(overlaps ? window.innerHeight - bannerRect.top + BANNER_GAP : EDGE_GAP);
    };

    recompute();
    window.addEventListener("resize", recompute);

    const resizeObserver = new ResizeObserver(recompute);
    const mutationObserver = new MutationObserver(() => {
      recompute();
      const banner = document.getElementById("bottom-banner-stack");
      if (banner) resizeObserver.observe(banner);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    const initialBanner = document.getElementById("bottom-banner-stack");
    if (initialBanner) resizeObserver.observe(initialBanner);

    return () => {
      window.removeEventListener("resize", recompute);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      style={{ bottom: bottomOffset }}
      className="fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/[0.04] bg-[#26262B]/70 text-white backdrop-blur-[74px] transition-colors hover:bg-[#4D4D55]/70"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
