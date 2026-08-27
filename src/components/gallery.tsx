"use client";

import { useMemo, useState } from "react";
import { roleFilters } from "@/lib/curators";
import type { Curator } from "@/lib/types";
import { CuratorCard } from "./curator-card";

export function Gallery({ curators }: { curators: Curator[] }) {
  const [active, setActive] = useState<(typeof roleFilters)[number]>("Все");

  const filtered = useMemo(
    () => (active === "Все" ? curators : curators.filter((c) => c.role === active)),
    [curators, active],
  );

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

      {filtered.length > 0 ? (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {filtered.map((curator) => (
            <CuratorCard key={curator.slug} curator={curator} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-white/40">Пока нет портфолио в этой категории.</p>
      )}
    </section>
  );
}
