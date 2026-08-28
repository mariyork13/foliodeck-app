"use client";

import Link from "next/link";
import { useState } from "react";
import { CARD_TAG_PRIORITY } from "@/lib/designers/constants";
import type { Designer } from "@/lib/designers/types";

// All taxonomy values the designer has, ordered by category priority (industry
// first) and de-duplicated across categories.
function cardTags(designer: Designer): string[] {
  const out: string[] = [];
  for (const category of CARD_TAG_PRIORITY) {
    for (const name of designer.taxonomy[category]) {
      if (!out.includes(name)) out.push(name);
    }
  }
  return out;
}

export function DesignerCard({ designer }: { designer: Designer }) {
  const [loaded, setLoaded] = useState(false);
  const tags = cardTags(designer);

  return (
    <Link href={`/designer/${designer.slug}`} scroll={false} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-[#2A2A2E]">
        {designer.openToWork && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-green-400 px-2.5 py-1 text-[11px] font-medium text-black shadow-sm">
            Ищет работу
          </span>
        )}
        {designer.coverImage ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={designer.coverImage}
              alt=""
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-cover object-top transition-[transform,opacity] duration-500 group-hover:scale-[1.02] ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[13px] text-white/20">
            Без обложки
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-medium text-white/90">
          {designer.firstName} {designer.lastName}
        </h3>
        <p className="text-sm text-white/30">{designer.grade}</p>
        {tags.length > 0 && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/40">
            {tags.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
