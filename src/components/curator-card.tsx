"use client";

import { TEXT_SCALE } from "@/lib/scale";
import type { Curator } from "@/lib/types";

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function CuratorCard({ curator }: { curator: Curator }) {
  return (
    <div className="mb-6 break-inside-avoid">
      <div className="mb-2">
        <h3 className={`${TEXT_SCALE} font-medium text-white/90`}>{curator.name}</h3>
        <p className={`${TEXT_SCALE} text-white/30`}>{curator.role}</p>
      </div>

      <a
        href={curator.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl bg-white"
      >
        <span
          className={`absolute left-2.5 top-2.5 z-10 rounded-full bg-[#ff4a4a] px-2.5 py-1 ${TEXT_SCALE} font-medium text-white [font-family:var(--font-roboto),Arial,sans-serif]`}
        >
          {hostname(curator.externalUrl)}
        </span>
        <span className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={curator.previewImage}
          alt={`${curator.name} portfolio preview`}
          loading="lazy"
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </a>
    </div>
  );
}
