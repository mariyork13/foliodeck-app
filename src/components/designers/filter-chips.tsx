"use client";

import { EXPERIENCE_RANGES } from "@/lib/designers/constants";
import {
  FILTER_GROUPS,
  useDesignerFilter,
  type FilterGroup,
} from "@/lib/designers/filter-context";
import { XIcon } from "@/components/x-icon";

function chipLabel(group: FilterGroup, value: string): string {
  if (group === "experience") {
    return EXPERIENCE_RANGES.find((r) => r.id === value)?.label ?? value;
  }
  return value;
}

export function DesignerFilterChips() {
  const {
    selected,
    toggle,
    clearAll,
    activeCount,
    openToWorkOnly,
    setOpenToWorkOnly,
    search,
    setSearch,
  } = useDesignerFilter();

  if (activeCount === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {openToWorkOnly && (
        <button
          type="button"
          onClick={() => setOpenToWorkOnly(false)}
          className="flex items-center gap-1.5 rounded-full bg-green-400 px-3 py-1 text-[13px] font-medium text-black hover:bg-green-300"
        >
          Ищет работу
          <XIcon />
        </button>
      )}
      {search.trim() && (
        <button
          type="button"
          onClick={() => setSearch("")}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] text-white hover:bg-white/15"
        >
          «{search.trim()}»
          <XIcon />
        </button>
      )}

      {FILTER_GROUPS.flatMap((group) =>
        [...selected[group]].map((value) => (
          <button
            key={`${group}:${value}`}
            type="button"
            onClick={() => toggle(group, value)}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] text-white hover:bg-white/15"
          >
            {chipLabel(group, value)}
            <XIcon />
          </button>
        )),
      )}

      <button
        type="button"
        onClick={clearAll}
        className="rounded-full px-3 py-1 text-[13px] text-white/40 hover:text-white"
      >
        Clear all
      </button>
    </div>
  );
}
