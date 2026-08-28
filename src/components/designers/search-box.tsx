"use client";

import { useDesignerFilter } from "@/lib/designers/filter-context";
import { SearchIcon } from "@/components/icons";
import { XIcon } from "@/components/x-icon";

export function DesignerSearchBox() {
  const { search, setSearch } = useDesignerFilter();

  return (
    <div className="relative min-w-0 rounded-lg border border-white/[0.04] bg-[#26262B]/70 backdrop-blur-[74px]">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Имя, компания, индустрия, навык, тип интерфейса…"
        className="w-full rounded-lg bg-transparent py-[9px] pl-8 pr-8 text-[13px] text-white placeholder:text-white/50 focus:outline-none"
      />
      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          aria-label="Очистить поиск"
          className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}
