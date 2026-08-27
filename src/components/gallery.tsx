"use client";

import { useMemo } from "react";
import { useFilter } from "@/lib/filter-context";
import { chunkIntoRows } from "@/lib/rowTemplates";
import type { Curator } from "@/lib/types";
import { CuratorCard } from "./curator-card";

export function Gallery({ curators }: { curators: Curator[] }) {
  const { active } = useFilter();

  const filtered = useMemo(
    () => (active === "Все" ? curators : curators.filter((c) => c.role === active)),
    [curators, active],
  );

  const rows = useMemo(() => chunkIntoRows(filtered), [filtered]);

  return (
    <section className="mx-auto max-w-[1920px] px-4 pb-24 pt-8">
      {rows.length > 0 ? (
        <div className="flex flex-col gap-[100px]">
          {rows.map(({ template, cells }, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 gap-4 ${template.align === "end" ? "items-end" : "items-start"}`}
            >
              {cells.map(({ slot, card }) => (
                <div
                  key={card.slug}
                  style={{
                    gridColumn: slot.colStart
                      ? `${slot.colStart} / span ${slot.colSpan}`
                      : `span ${slot.colSpan}`,
                    gridRow: slot.rowStart ? `${slot.rowStart} / span ${slot.rowSpan ?? 1}` : undefined,
                  }}
                >
                  <CuratorCard curator={card} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-white/40">Пока нет портфолио в этой категории.</p>
      )}
    </section>
  );
}
