"use client";

import { collectionOptions, companyOptions, geoOptions, specializationOptions } from "@/lib/filterOptions";
import { useFilter, type FilterGroup } from "@/lib/filter-context";
import { CompanyLogo } from "./company-logo";
import { XIcon } from "./x-icon";

function FilterOption({
  label,
  checked,
  onToggle,
  showLogo,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  showLogo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-2 whitespace-nowrap py-1 text-left text-base outline-none transition-colors ${
        checked ? "text-white" : "text-white/60 hover:text-white"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {showLogo && <CompanyLogo name={label} />}
        <span className="truncate">{label}</span>
      </span>
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
  showLogos,
  className,
}: {
  title: string;
  group: FilterGroup;
  options: readonly string[];
  scroll?: boolean;
  showLogos?: boolean;
  className?: string;
}) {
  const { selected, toggle } = useFilter();
  return (
    <div className={`flex w-full shrink-0 flex-col sm:w-44 ${scroll ? "sm:h-full sm:min-h-0" : ""} ${className ?? ""}`}>
      <h3 className="mb-3 shrink-0 text-base font-medium text-white">{title}</h3>
      <div className={scroll ? "sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:pr-2" : ""}>
        {options.map((option) => (
          <FilterOption
            key={option}
            label={option}
            checked={selected[group].has(option)}
            onToggle={() => toggle(group, option)}
            showLogo={showLogos}
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
      className="absolute left-3 right-3 top-[calc(100%-8px)] z-50 sm:left-auto"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute right-14 -top-2 hidden h-2 w-4 bg-[#1e1e21]/70 backdrop-blur-[74px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)] sm:block" />
      <div className="grid max-h-[70vh] grid-cols-2 gap-x-4 overflow-y-auto rounded-xl bg-[#1e1e21]/70 p-6 backdrop-blur-[74px] sm:flex sm:h-[436px] sm:max-h-none sm:w-[640px] sm:flex-row sm:gap-8 sm:overflow-visible">
        <div className="col-start-1 flex w-full shrink-0 flex-col gap-6 sm:contents">
          <FilterColumn
            title="Direction"
            group="specialization"
            options={specializationOptions}
            className="sm:order-1"
          />
          <div className="flex w-full shrink-0 flex-col gap-6 sm:order-3 sm:w-44">
            <FilterColumn title="Geography" group="geo" options={geoOptions} />
            <FilterColumn title="Collections" group="collections" options={collectionOptions} />
          </div>
        </div>
        <FilterColumn
          title="Project"
          group="company"
          options={companyOptions}
          scroll
          showLogos
          className="col-start-2 sm:order-2"
        />
      </div>
    </div>
  );
}
