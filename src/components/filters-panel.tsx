"use client";

import { useFilter, type FilterGroup } from "@/lib/filter-context";
import type { FilterOptions } from "@/lib/types";
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
  // `true` → own scrollbar at every width; `"sm"` → only once the panel becomes
  // a row (below that the whole left column shares one scroll area).
  scroll?: boolean | "sm";
  showLogos?: boolean;
  className?: string;
}) {
  const { selected, toggle } = useFilter();
  const rootScroll = scroll === true ? "h-full min-h-0" : scroll === "sm" ? "sm:h-full sm:min-h-0" : "";
  const listScroll =
    scroll === true
      ? "min-h-0 flex-1 overflow-y-auto pr-2"
      : scroll === "sm"
        ? "sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:pr-2"
        : "";
  return (
    <div className={`flex w-full shrink-0 flex-col sm:w-44 ${rootScroll} ${className ?? ""}`}>
      <h3 className="mb-3 shrink-0 text-base font-medium text-white">{title}</h3>
      <div className={listScroll}>
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
  options,
}: {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  options: FilterOptions;
}) {
  return (
    <div
      className="absolute left-3 right-3 top-[calc(100%-8px)] z-50 sm:left-auto"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute right-14 -top-2 hidden h-2 w-4 bg-[#1e1e21]/70 backdrop-blur-[74px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)] sm:block" />
      {/* Fixed height + `overflow-hidden` so each column scrolls inside its own
          track rather than the whole panel moving as one. */}
      <div className="grid h-[70vh] max-h-[436px] grid-cols-2 gap-x-4 overflow-hidden rounded-xl bg-[#1e1e21]/70 p-6 backdrop-blur-[74px] sm:flex sm:h-[436px] sm:max-h-none sm:w-[640px] sm:flex-row sm:gap-8 sm:overflow-visible">
        {/* Below sm this is the single scrolling "left column" (Design + Geography
            + Collections); from sm up `contents` promotes its children to flex
            siblings so each one scrolls on its own. */}
        <div className="col-start-1 flex min-h-0 w-full shrink-0 flex-col gap-6 overflow-y-auto pr-1 sm:contents">
          <FilterColumn
            title="Design"
            group="specialization"
            options={options.specializations}
            scroll="sm"
            className="sm:order-1"
          />
          <div className="flex shrink-0 flex-col gap-6 sm:order-3 sm:h-full sm:w-44 sm:min-h-0 sm:overflow-y-auto sm:pr-2">
            <FilterColumn title="Geography" group="geo" options={options.geo} />
            <FilterColumn title="Collections" group="collections" options={options.collections} />
          </div>
        </div>
        <FilterColumn
          title="Project"
          group="company"
          options={options.companies}
          scroll
          showLogos
          className="col-start-2 sm:order-2"
        />
      </div>
    </div>
  );
}
