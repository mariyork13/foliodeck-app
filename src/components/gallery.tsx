"use client";

import { useMemo, useState } from "react";
import { roleFilters } from "@/lib/curators";
import { chunkIntoRows } from "@/lib/rowTemplates";
import type { Curator } from "@/lib/types";
import { CuratorCard } from "./curator-card";

export function Gallery({ curators }: { curators: Curator[] }) {
  const [active, setActive] = useState<(typeof roleFilters)[number]>("Все");

  const filtered = useMemo(
    () => (active === "Все" ? curators : curators.filter((c) => c.role === active)),
    [curators, active],
  );

  const rows = useMemo(() => chunkIntoRows(filtered), [filtered]);

  return (
    <section className="mx-auto max-w-[1920px] px-5 pb-24 pt-8 sm:px-6">
      <div className="mb-8 flex flex-wrap gap-2">
        {roleFilters.map((role) => (
          <button
            key={role}
            onClick={() => setActive(role)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === role
                ? "bg-white text-black"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

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
