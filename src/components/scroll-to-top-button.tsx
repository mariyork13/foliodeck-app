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
      const cards = banner ? Array.from(banner.children) : [];
      if (cards.length === 0) {
        setBottomOffset(EDGE_GAP);
        return;
      }
      const buttonRight = window.innerWidth - EDGE_GAP;
      const buttonLeft = buttonRight - BUTTON_SIZE;

      // The stack container spans the full width (inset-x-0), so measure the
      // actual banner cards instead: a centered card on desktop never reaches
      // the right-edge button and must not push it up. The cards are always
      // bottom-anchored, so a horizontal overlap with any of them means the
      // button should clear the whole stack (topmost card's top).
      let liftedTop = Infinity;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const horizontalOverlap = rect.right > buttonLeft && rect.left < buttonRight;
        if (horizontalOverlap) liftedTop = Math.min(liftedTop, rect.top);
      }

      setBottomOffset(
        liftedTop === Infinity ? EDGE_GAP : window.innerHeight - liftedTop + BANNER_GAP,
      );
    };

    recompute();
    window.addEventListener("resize", recompute);

    const resizeObserver = new ResizeObserver(recompute);
    const observeBanner = () => {
      const banner = document.getElementById("bottom-banner-stack");
      if (!banner) return;
      resizeObserver.observe(banner);
      for (const card of Array.from(banner.children)) resizeObserver.observe(card);
    };
    const mutationObserver = new MutationObserver(() => {
      recompute();
      observeBanner();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    observeBanner();

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
