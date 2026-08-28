"use client";

import Link from "next/link";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites-context";
import { TEXT_SCALE } from "@/lib/scale";
import type { Curator } from "@/lib/types";
import { ExternalLinkIcon, HeartIcon } from "./icons";

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
          <HeartIcon active={isFavorited} />
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
          <ExternalLinkIcon />
        </button>
        {!loaded && (
          <div className="absolute inset-0 overflow-hidden bg-[#2A2A2E]">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={curator.previewImage}
          alt={`${curator.name} portfolio preview`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover object-top transition-[transform,opacity] duration-500 group-hover:scale-[1.02] ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </Link>
    </div>
  );
}
