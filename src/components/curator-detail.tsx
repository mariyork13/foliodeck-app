"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites-context";
import { TEXT_SCALE } from "@/lib/scale";
import type { Curator } from "@/lib/types";
import { ChevronLeftIcon, ExternalLinkIcon, HeartIcon, HistoryIcon } from "./icons";

const pillBg = "bg-[#26262B]/70 backdrop-blur-[74px] transition-colors hover:bg-[#4D4D55]/70";
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
          <div className="min-w-0 truncate">
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
                    className={`absolute left-3 right-3 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl bg-[#1e1e21]/70 p-4 ${TEXT_SCALE} leading-relaxed text-white/80 backdrop-blur-[74px] sm:left-auto sm:w-80`}
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

      <div className="min-h-0 flex-1 px-4 pb-4">
        <iframe
          src={curator.externalUrl}
          title={`${curator.name} portfolio`}
          className="h-full w-full rounded-[8px] border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
