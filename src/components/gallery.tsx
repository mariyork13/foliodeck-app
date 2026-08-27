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
        <div className="flex flex-col gap-8">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-4">
              {row.map(({ size, item }) => (
                <CuratorCard key={item.slug} curator={item} size={size} />
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
