"use client";

import Link from "next/link";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites-context";
import { TEXT_SCALE } from "@/lib/scale";
import type { Curator } from "@/lib/types";
import { ExternalLinkIcon, HeartIcon, HistoryIcon } from "./icons";

// Always visible on touch devices (no hover); hover-reveal only from lg up.
const iconBadge =
  "flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#5D5D72]/30 backdrop-blur-[74px] text-white opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100";

export function CuratorCard({
  curator,
  compact,
  stretch,
}: {
  curator: Curator;
  compact?: boolean;
  stretch?: boolean;
}) {
  const { isFavorited: checkFavorited, toggleFavorite } = useFavorites();
  const isFavorited = checkFavorited(curator.slug);
  const textClamp = compact ? "truncate" : "";
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const cardImage = curator.coverImage || curator.previewImage;
  const hasBothLanguages = Boolean(curator.notes) && Boolean(curator.notesRu);
  // Same RU-first default as the detail page's Notes popover.
  const [notesLang, setNotesLang] = useState<"ru" | "en">(curator.notesRu ? "ru" : "en");
  const notesText = notesLang === "ru" ? curator.notesRu ?? curator.notes : curator.notes ?? curator.notesRu;

  return (
    <div className={stretch ? "flex h-full flex-col" : ""}>
      <div className="mb-2 shrink-0">
        <h3 className={`${TEXT_SCALE} font-medium text-white/90 ${textClamp}`}>{curator.name}</h3>
        <p className={`${TEXT_SCALE} text-white/30 ${textClamp}`}>{curator.role}</p>
      </div>

      <Link
        href={`/curator/${curator.slug}`}
        className={`group relative block overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#2A2A2E] shadow-[0_4px_4px_0_rgba(0,0,0,0.12)] ${stretch ? "flex-1" : "aspect-[4/3]"}`}
      >
        <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
          {notesText && (
            <div
              className="relative"
              onMouseEnter={() => setNotesOpen(true)}
              onMouseLeave={() => setNotesOpen(false)}
            >
              <button
                type="button"
                aria-label="Curator notes"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={iconBadge}
              >
                <HistoryIcon />
              </button>
              {notesOpen && (
                // Invisible spacer (no gap from the button, just padding) so the
                // pointer never leaves the hoverable area on its way down to the
                // visible bubble below — a real CSS gap here would drop the hover
                // state (and the popup) before the cursor reaches it.
                <div className="absolute right-0 top-full z-20 pt-2">
                  <div
                    className="w-64 max-w-[80vw] rounded-xl bg-[#1e1e21]/70 px-4 py-3 text-[13px] leading-[1.55] text-white/80 backdrop-blur-[74px]"
                    onClick={(e) => e.preventDefault()}
                  >
                    {hasBothLanguages && (
                      <div className="mb-2 flex items-center gap-1 text-xs font-medium">
                        {(["ru", "en"] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setNotesLang(lang);
                            }}
                            className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
                              notesLang === lang ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                    {notesText}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(curator.slug);
            }}
            className={iconBadge}
          >
            <HeartIcon active={isFavorited} />
          </button>
        </div>
        <button
          type="button"
          aria-label="Open external site"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(curator.externalUrl, "_blank", "noopener,noreferrer");
          }}
          className={`absolute bottom-2 right-2 z-10 ${iconBadge}`}
        >
          <ExternalLinkIcon />
        </button>
        {/* Grey underlay — animated while loading, static once the image (or a dead state) resolves. */}
        <div className="absolute inset-0 overflow-hidden bg-[#2A2A2E]">
          {!loaded && !errored && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}
        </div>
        {!errored && cardImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cardImage}
            alt={`${curator.name} portfolio preview`}
            loading="lazy"
            // Decode off the main thread so a fresh card scrolling into view
            // doesn't stall the scroll while its (up-to-2400px) image decodes.
            decoding="async"
            // onLoad doesn't fire for images already in the browser cache — catch those on mount.
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
            }}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className="relative h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
      </Link>
    </div>
  );
}
