"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites-context";
import { TEXT_SCALE } from "@/lib/scale";
import type { Curator } from "@/lib/types";

const pillBg = "bg-[#26262B]/70 backdrop-blur-[74px] transition-colors hover:bg-[#4D4D55]/70";
// Matches the main site header's button sizing.
const BTN_TEXT = "text-[13px]";
// Icon-only square tap target on tablet and below; full text+icon pill from lg up.
const PAD_BTN = "px-3 py-2.5 lg:px-4";

export function CuratorDetail({ curator }: { curator: Curator }) {
  const router = useRouter();
  const { isFavorited: checkFavorited, toggleFavorite } = useFavorites();
  const isFavorited = checkFavorited(curator.slug);
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-[#161618]">
      <header className="flex shrink-0 items-center justify-between gap-4 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className={`flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] ${PAD_BTN} ${BTN_TEXT} font-medium text-white ${pillBg}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="hidden lg:inline">Back</span>
          </button>
          <div className="min-w-0 truncate">
            <span className={`${TEXT_SCALE} font-medium text-white`}>{curator.name}</span>
            <span className={`${TEXT_SCALE} ml-2 text-white/40`}>{curator.role}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0">
          {curator.notes && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotesOpen((v) => !v)}
                className={`flex items-center justify-center gap-2 rounded-lg ${PAD_BTN} ${BTN_TEXT} font-medium text-white ${pillBg}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
                <span className="hidden lg:inline">Notes</span>
              </button>
              {notesOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotesOpen(false)} />
                  <div
                    className={`absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-xl bg-[#1e1e21]/70 p-4 ${TEXT_SCALE} leading-relaxed text-white/80 backdrop-blur-[74px]`}
                  >
                    {curator.notes}
                  </div>
                </>
              )}
            </div>
          )}
          <a
            href={curator.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 rounded-full ${PAD_BTN} ${BTN_TEXT} font-medium text-white ${pillBg}`}
          >
            <span className="hidden lg:inline">Visit</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => toggleFavorite(curator.slug)}
            className={`flex items-center justify-center gap-2 rounded-lg ${PAD_BTN} ${BTN_TEXT} font-medium text-white ${pillBg}`}
          >
            <span className="hidden lg:inline">Favorites</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={isFavorited ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21s-6.716-4.35-9.428-8.06C.5 10.1 1.2 6.5 4.2 5.1 6.6 4 9.2 4.8 12 8c2.8-3.2 5.4-4 7.8-2.9 3 1.4 3.7 5 1.628 7.84C18.716 16.65 12 21 12 21Z" />
            </svg>
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
