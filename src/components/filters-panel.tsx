"use client";

import { collectionOptions, companyOptions, geoOptions, specializationOptions } from "@/lib/filterOptions";
import { useFilter, type FilterGroup } from "@/lib/filter-context";
import { XIcon } from "./x-icon";

function FilterOption({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-2 whitespace-nowrap py-1 text-left text-base outline-none transition-colors ${
        checked ? "text-white" : "text-white/60 hover:text-white"
      }`}
    >
      <span>{label}</span>
      {checked && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <XIcon />
        </span>
      )}
    </button>
  );
}

function FilterColumn({
  title,
  group,
  options,
  scroll,
}: {
  title: string;
  group: FilterGroup;
  options: readonly string[];
  scroll?: boolean;
}) {
  const { selected, toggle } = useFilter();
  return (
    <div className={`flex w-44 shrink-0 flex-col ${scroll ? "h-full min-h-0" : ""}`}>
      <h3 className="mb-3 shrink-0 text-base font-medium text-white">{title}</h3>
      <div className={scroll ? "min-h-0 flex-1 overflow-y-auto pr-2" : ""}>
        {options.map((option) => (
          <FilterOption
            key={option}
            label={option}
            checked={selected[group].has(option)}
            onToggle={() => toggle(group, option)}
          />
        ))}
      </div>
    </div>
  );
}

export function FiltersPanel({
  onMouseEnter,
  onMouseLeave,
}: {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="absolute right-3 top-[calc(100%-8px)] z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute right-14 -top-2 h-2 w-4 bg-[#1e1e21]/70 backdrop-blur-[74px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
      <div className="flex h-[436px] w-[640px] gap-8 rounded-xl bg-[#1e1e21]/70 p-6 backdrop-blur-[74px]">
        <FilterColumn title="Специализация" group="specialization" options={specializationOptions} />
        <FilterColumn title="Компания" group="company" options={companyOptions} scroll />
        <div className="flex w-44 shrink-0 flex-col gap-6">
          <FilterColumn title="География" group="geo" options={geoOptions} />
          <FilterColumn title="Коллекции" group="collections" options={collectionOptions} />
        </div>
      </div>
    </div>
  );
}
