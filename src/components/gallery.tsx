"use client";

import { useMemo } from "react";
import { useFilter } from "@/lib/filter-context";
import { chunkIntoRows } from "@/lib/rowTemplates";
import type { Curator } from "@/lib/types";
import { CuratorCard } from "./curator-card";

// Best-effort match from the real specialization taxonomy to the free-text
// role strings in the sample data, until curators carry real tags.
const SPEC_TO_ROLE_SUBSTRING: Record<string, string> = {
  "Product & UI UX": "UI UX",
  Graphic: "Graphic",
  Brand: "Brand",
  Multidisciplinary: "Multidisciplinary",
  Digital: "Digital",
  "Motion & 3D": "Motion",
};

export function Gallery({ curators }: { curators: Curator[] }) {
  const { selected } = useFilter();

  const filtered = useMemo(() => {
    if (selected.specialization.size === 0) return curators;
    return curators.filter((c) =>
      [...selected.specialization].some((tag) => c.role.includes(SPEC_TO_ROLE_SUBSTRING[tag] ?? tag)),
    );
  }, [curators, selected.specialization]);

  const rows = useMemo(() => chunkIntoRows(filtered), [filtered]);

  return (
    <section className="mx-auto max-w-[1920px] px-4 pb-24 pt-8">
      {rows.length > 0 ? (
        <>
          {/* Tablet and below: simplest possible layout, two cards per row. */}
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            {filtered.map((card) => (
              <CuratorCard key={card.slug} curator={card} />
            ))}
          </div>

          {/* Desktop: the hand-authored row-template layout. */}
          <div className="hidden flex-col gap-[100px] lg:flex">
            {rows.map(({ template, cells }, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 gap-4 ${template.align === "end" ? "items-end" : "items-start"}`}
              >
                {cells.map(({ slot, card }) => {
                  const spansRows = (slot.rowSpan ?? 1) > 1;
                  return (
                    <div
                      key={card.slug}
                      style={{
                        gridColumn: slot.colStart
                          ? `${slot.colStart} / span ${slot.colSpan}`
                          : `span ${slot.colSpan}`,
                        gridRow: slot.rowStart ? `${slot.rowStart} / span ${slot.rowSpan ?? 1}` : undefined,
                        alignSelf: spansRows ? "stretch" : undefined,
                      }}
                    >
                      <CuratorCard curator={card} stretch={spansRows} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="py-16 text-center text-white/40">No portfolios in this category yet.</p>
      )}
    </section>
  );
}
