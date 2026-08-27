"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites-context";
import { TEXT_SCALE } from "@/lib/scale";
import type { Curator } from "@/lib/types";

const iconBadge =
  "flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#5D5D72]/30 backdrop-blur-[74px] text-white opacity-0 transition-opacity group-hover:opacity-100";

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

  return (
    <div className={stretch ? "flex h-full flex-col" : ""}>
      <div className="mb-2 shrink-0">
        <h3 className={`${TEXT_SCALE} font-medium text-white/90 ${textClamp}`}>{curator.name}</h3>
        <p className={`${TEXT_SCALE} text-white/30 ${textClamp}`}>{curator.role}</p>
      </div>

      <Link
        href={`/curator/${curator.slug}`}
        className={`group relative block overflow-hidden rounded-[8px] bg-white ${stretch ? "flex-1" : "aspect-[4/3]"}`}
      >
        <button
          type="button"
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(curator.slug);
          }}
          className={`absolute right-2 top-2 z-10 ${iconBadge}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isFavorited ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 21s-6.716-4.35-9.428-8.06C.5 10.1 1.2 6.5 4.2 5.1 6.6 4 9.2 4.8 12 8c2.8-3.2 5.4-4 7.8-2.9 3 1.4 3.7 5 1.628 7.84C18.716 16.65 12 21 12 21Z" />
          </svg>
        </button>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={curator.previewImage}
          alt={`${curator.name} portfolio preview`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </Link>
    </div>
  );
}
