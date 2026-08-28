"use client";

import { useMemo } from "react";
import { useFilter } from "@/lib/filter-context";
import { chunkIntoRows } from "@/lib/rowTemplates";
import type { Curator } from "@/lib/types";
import { CuratorCard } from "./curator-card";

export function Gallery({ curators }: { curators: Curator[] }) {
  const { selected, search } = useFilter();

  const filtered = useMemo(() => {
    let result = curators;

    if (selected.specialization.size > 0) {
      result = result.filter((c) => c.specializations.some((s) => selected.specialization.has(s)));
    }
    if (selected.company.size > 0) {
      result = result.filter((c) => c.companies?.some((co) => selected.company.has(co)));
    }
    if (selected.geo.size > 0) {
      result = result.filter((c) => c.geo && selected.geo.has(c.geo));
    }
    if (selected.collections.size > 0) {
      result = result.filter((c) => c.collections?.some((col) => selected.collections.has(col)));
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.role.toLowerCase().includes(query) ||
          c.companies?.some((co) => co.toLowerCase().includes(query)),
      );
    }

    return result;
  }, [curators, selected, search]);

  const rows = useMemo(() => chunkIntoRows(filtered), [filtered]);

  return (
    <section className="mx-auto max-w-[1920px] px-4 pb-24 pt-4 sm:pt-8">
      {rows.length > 0 ? (
        <>
          {/* Mobile: one card per row. Tablet: two cards per row. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
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
        <p className="py-16 text-center text-white/40">No portfolios found.</p>
      )}
    </section>
  );
}
