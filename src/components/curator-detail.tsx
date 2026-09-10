"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFavorites } from "@/lib/favorites-context";
import { TEXT_SCALE } from "@/lib/scale";
import type { Curator } from "@/lib/types";
import { ChevronLeftIcon, ExternalLinkIcon, HeartIcon, HistoryIcon } from "./icons";

const FRAME =
  "relative h-full w-full overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#2A2A2E] shadow-[0_4px_4px_0_rgba(0,0,0,0.12)]";

// `max-lg:active:` gives touch devices (mobile + tablet) a pressed-state colour
// change, since there's no hover there.
const pillBg =
  "bg-[#26262B]/70 backdrop-blur-[74px] transition-colors hover:bg-[#4D4D55]/70 max-lg:active:bg-[#4D4D55]/70";
// Matches the main site header's button sizing.
const BTN_TEXT = "text-[13px]";
// Icon-only square tap target on tablet and below; full text+icon pill from lg up.
// Fixed height matches the main site header's pills regardless of icon/text state.
const PAD_BTN = "h-[39.5px] w-[39.5px] lg:w-auto lg:px-4";

export function CuratorDetail({ curator }: { curator: Curator }) {
  const router = useRouter();
  const { isFavorited: checkFavorited, toggleFavorite } = useFavorites();
  const isFavorited = checkFavorited(curator.slug);
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-[#161618]">
      <header className="relative flex shrink-0 items-center justify-between gap-4 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className={`flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] ${PAD_BTN} ${BTN_TEXT} font-medium text-white ${pillBg}`}
          >
            <ChevronLeftIcon size={14} />
            <span className="hidden lg:inline">Back</span>
          </button>
          {/* `text-white/40` on the truncating box so the clipped "…" matches the
              role colour rather than staying bright white. */}
          <div className="min-w-0 truncate text-white/40">
            <span className={`${TEXT_SCALE} font-medium text-white`}>{curator.name}</span>
            <span className={`${TEXT_SCALE} ml-2 text-white/40`}>{curator.role}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0">
          {curator.notes && (
            <>
              <button
                type="button"
                onClick={() => setNotesOpen((v) => !v)}
                className={`flex items-center justify-center gap-2 rounded-lg ${PAD_BTN} ${BTN_TEXT} font-medium text-white ${pillBg}`}
              >
                <HistoryIcon size={14} />
                <span className="hidden lg:inline">Notes</span>
              </button>
              {notesOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotesOpen(false)} />
                  <div
                    className={`absolute left-3 right-3 top-[calc(100%-8px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl bg-[#1e1e21]/70 p-4 text-[15px] leading-relaxed text-white/80 backdrop-blur-[74px] sm:left-auto sm:w-80`}
                  >
                    {curator.notes}
                  </div>
                </>
              )}
            </>
          )}
          <a
            href={curator.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 rounded-full ${PAD_BTN} ${BTN_TEXT} font-medium text-white ${pillBg}`}
          >
            <span className="hidden lg:inline">Visit</span>
            <ExternalLinkIcon size={14} />
          </a>
          <button
            type="button"
            onClick={() => toggleFavorite(curator.slug)}
            className={`flex items-center justify-center gap-2 rounded-lg ${PAD_BTN} ${BTN_TEXT} font-medium text-white ${pillBg}`}
          >
            <span className="hidden lg:inline">Favorites</span>
            <HeartIcon active={isFavorited} size={14} />
          </button>
        </div>
      </header>

      {/* Site view sits 16px below the header buttons — that gap is the header's
          own padding-bottom, so only the other three sides are padded here. */}
      <div className="min-h-0 flex-1 px-4 pb-4">
        <PortfolioView curator={curator} />
      </div>
    </div>
  );
}

function PortfolioView({ curator }: { curator: Curator }) {
  const [coverBroken, setCoverBroken] = useState(false);
  // Same fallback the card uses: a manually uploaded cover, else the auto
  // screenshot. Only when both are missing (or the image 404s) do we show the
  // "can't be shown" state instead of a real picture of the portfolio.
  const coverImage = curator.coverImage || curator.previewImage;
  const hasCover = Boolean(coverImage) && !coverBroken;

  // The detail page shows the live site. The card image is only the fallback
  // here — for sites that refuse to be framed (Tilda etc.).
  //   embeddable === false → skip the frame, straight to the fallback
  //   embeddable === true  → trust the frame
  //   embeddable == null   → try the frame, but give up after a few seconds if
  //                          it never confirms a real cross-origin load
  const [status, setStatus] = useState<"try" | "ok" | "blocked">(
    curator.embeddable === false ? "blocked" : "try",
  );
  const trusted = curator.embeddable === true;

  useEffect(() => {
    if (status !== "try" || trusted || !curator.externalUrl) return;
    const t = setTimeout(() => setStatus((s) => (s === "try" ? "blocked" : s)), 4000);
    return () => clearTimeout(t);
  }, [status, trusted, curator.externalUrl]);

  const onFrameLoad = (e: { target: EventTarget | null }) => {
    if (trusted) return;
    try {
      // A real cross-origin page throws on this read; a frame that was blocked
      // (X-Frame-Options / CSP) sits on an about:blank we *can* read.
      const href = (e.target as HTMLIFrameElement).contentWindow?.location.href;
      if (href && href !== "about:blank") setStatus("ok");
    } catch {
      setStatus("ok");
    }
  };

  const showFrame = Boolean(curator.externalUrl) && status !== "blocked";

  if (showFrame) {
    return (
      <iframe
        src={curator.externalUrl}
        title={`${curator.name} portfolio`}
        onLoad={onFrameLoad}
        className={`${FRAME} border-0`}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
      />
    );
  }

  if (hasCover) {
    return (
      <div className={FRAME}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={`${curator.name} portfolio`}
          onError={() => setCoverBroken(true)}
          className="h-full w-full object-cover object-top"
        />
      </div>
    );
  }

  // Site blocks framing and there's no image to show instead.
  return (
    <div className={`${FRAME} flex flex-col items-center justify-center gap-4 text-center`}>
      <p className={`${TEXT_SCALE} text-white/50`}>This site can&apos;t be shown here.</p>
      <a
        href={curator.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 rounded-full px-5 py-2.5 ${BTN_TEXT} font-medium text-white ${pillBg}`}
      >
        Visit portfolio
        <ExternalLinkIcon size={14} />
      </a>
    </div>
  );
}
