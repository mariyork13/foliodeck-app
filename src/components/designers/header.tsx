"use client";

import Link from "next/link";
import { useDesignerFilter } from "@/lib/designers/filter-context";
import { DesignerFilterBar } from "./filter-bar";
import { DesignerFilterChips } from "./filter-chips";
import { DesignerSearchBox } from "./search-box";

const TEXT = "text-[13px]";

export function DesignerHeader() {
  const { filtered, designers } = useDesignerFilter();

  return (
    <header className="sticky top-0 z-30 bg-[#161618]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1920px] px-4 pb-3 pt-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-medium text-white">Выпускники</h1>
          <Link
            href="/admin/designers/new"
            className={`shrink-0 rounded-full border border-[#C6CDD3]/[0.26] bg-white/90 px-4 py-[9px] ${TEXT} font-medium text-black/90 backdrop-blur-[74px]`}
          >
            + Добавить
          </Link>
        </div>

        <DesignerSearchBox />

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <DesignerFilterBar />
          <span className="text-[13px] text-white/40">
            {filtered.length === designers.length
              ? `${designers.length} дизайнеров`
              : `${filtered.length} из ${designers.length}`}
          </span>
        </div>

        <DesignerFilterChips />
      </div>
    </header>
  );
}
