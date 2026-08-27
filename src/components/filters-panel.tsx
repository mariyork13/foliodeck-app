"use client";

import { collectionOptions, companyOptions, geoOptions, specializationOptions } from "@/lib/filterOptions";
import { useFilter, type FilterGroup } from "@/lib/filter-context";

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-white/70 hover:text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 shrink-0 rounded-sm border-white/30 bg-transparent accent-white"
      />
      {label}
    </label>
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
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-medium text-white">{title}</h3>
      <div className={scroll ? "max-h-64 overflow-y-auto pr-2" : ""}>
        {options.map((option) => (
          <CheckboxItem
            key={option}
            label={option}
            checked={selected[group].has(option)}
            onChange={() => toggle(group, option)}
          />
        ))}
      </div>
    </div>
  );
}

export function FiltersPanel() {
  const { reset } = useFilter();

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 flex w-[560px] gap-8 rounded-xl border border-white/10 bg-[#1e1e21] p-6 shadow-xl">
      <FilterColumn title="Специализация" group="specialization" options={specializationOptions} />
      <FilterColumn title="Компания" group="company" options={companyOptions} scroll />
      <div className="flex min-w-0 flex-col gap-6">
        <FilterColumn title="География" group="geo" options={geoOptions} />
        <FilterColumn title="Коллекции" group="collections" options={collectionOptions} />
        <button
          onClick={reset}
          className="mt-auto self-start text-sm font-medium text-white/50 underline underline-offset-2 hover:text-white"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
}
