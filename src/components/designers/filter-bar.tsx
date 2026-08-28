"use client";

import { useState } from "react";
import {
  CATEGORY_FILTER_LABELS,
  EXPERIENCE_RANGES,
  GRADES,
  PROGRAMS,
  TAXONOMY_CATEGORIES,
} from "@/lib/designers/constants";
import { useDesignerFilter, type FilterGroup } from "@/lib/designers/filter-context";

type Option = { value: string; label: string };

function FilterMenu({
  label,
  group,
  options,
}: {
  label: string;
  group: FilterGroup;
  options: Option[];
}) {
  const { selected, toggle, clearGroup } = useDesignerFilter();
  const [open, setOpen] = useState(false);
  const count = selected[group].size;

  if (options.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
          count > 0
            ? "bg-white text-black"
            : "bg-[#26262B]/70 text-white/80 hover:bg-[#4D4D55]/70"
        }`}
      >
        {label}
        {count > 0 && <span className="tabular-nums">{count}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-[60vh] w-60 overflow-y-auto rounded-xl bg-[#1e1e21]/95 p-2 shadow-xl backdrop-blur-[74px] max-sm:fixed max-sm:inset-x-3 max-sm:bottom-3 max-sm:left-3 max-sm:right-3 max-sm:top-auto max-sm:max-h-[70vh] max-sm:w-auto">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[13px] font-medium text-white/90">{label}</span>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => clearGroup(group)}
                  className="text-[12px] text-white/40 hover:text-white"
                >
                  Сбросить
                </button>
              )}
            </div>
            {options.map((option) => {
              const checked = selected[group].has(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(group, option.value)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${
                    checked ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {checked && <span className="shrink-0 text-white/70">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function DesignerFilterBar() {
  const { options, openToWorkOnly, setOpenToWorkOnly } = useDesignerFilter();

  const programOptions =
    options.programs.length > 0 ? options.programs : ([...PROGRAMS] as string[]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setOpenToWorkOnly(!openToWorkOnly)}
        className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
          openToWorkOnly
            ? "bg-green-400 text-black"
            : "bg-[#26262B]/70 text-white/80 hover:bg-[#4D4D55]/70"
        }`}
      >
        Ищет работу
      </button>
      {TAXONOMY_CATEGORIES.map((category) => (
        <FilterMenu
          key={category}
          label={CATEGORY_FILTER_LABELS[category]}
          group={category}
          options={options.taxonomy[category].map((name) => ({ value: name, label: name }))}
        />
      ))}
      <FilterMenu
        label="Grade"
        group="grade"
        options={GRADES.map((g) => ({ value: g, label: g }))}
      />
      <FilterMenu
        label="Experience"
        group="experience"
        options={EXPERIENCE_RANGES.map((r) => ({ value: r.id, label: r.label }))}
      />
      <FilterMenu
        label="Program"
        group="program"
        options={programOptions.map((p) => ({ value: p, label: p }))}
      />
      <FilterMenu
        label="Year"
        group="year"
        options={options.years.map((y) => ({ value: String(y), label: String(y) }))}
      />
    </div>
  );
}
