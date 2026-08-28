"use client";

import { useDesignerFilter } from "@/lib/designers/filter-context";
import { DesignerCard } from "./card";

export function DesignerGallery() {
  const { filtered } = useDesignerFilter();

  return (
    <section className="mx-auto max-w-[1920px] px-4 pb-24 pt-6">
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((designer) => (
            <DesignerCard key={designer.slug} designer={designer} />
          ))}
        </div>
      ) : (
        <p className="py-24 text-center text-[13px] text-white/40">Никого не найдено.</p>
      )}
    </section>
  );
}
