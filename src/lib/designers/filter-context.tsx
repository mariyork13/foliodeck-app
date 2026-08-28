"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { EXPERIENCE_RANGES, TAXONOMY_CATEGORIES, type TaxonomyCategory } from "./constants";
import type { Designer } from "./types";

export type FilterGroup =
  | TaxonomyCategory
  | "grade"
  | "experience"
  | "program"
  | "year";

export const FILTER_GROUPS: FilterGroup[] = [
  ...TAXONOMY_CATEGORIES,
  "grade",
  "experience",
  "program",
  "year",
];

type Selected = Record<FilterGroup, Set<string>>;

function emptySelected(): Selected {
  return {
    platform: new Set(),
    business_model: new Set(),
    industry: new Set(),
    interface_type: new Set(),
    skill: new Set(),
    company_type: new Set(),
    grade: new Set(),
    experience: new Set(),
    program: new Set(),
    year: new Set(),
  };
}

function matchesExperience(years: number | null, ranges: Set<string>): boolean {
  if (ranges.size === 0) return true;
  if (years == null) return false;
  return [...ranges].some((id) => {
    const range = EXPERIENCE_RANGES.find((r) => r.id === id);
    return range ? years >= range.min && years < range.max : false;
  });
}

type FilterContextValue = {
  designers: Designer[];
  filtered: Designer[];
  selected: Selected;
  toggle: (group: FilterGroup, value: string) => void;
  clearGroup: (group: FilterGroup) => void;
  clearAll: () => void;
  activeCount: number;
  openToWorkOnly: boolean;
  setOpenToWorkOnly: (value: boolean) => void;
  search: string;
  setSearch: (value: string) => void;
  options: {
    taxonomy: Record<TaxonomyCategory, string[]>;
    programs: string[];
    years: number[];
  };
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function DesignerFilterProvider({
  designers,
  taxonomy,
  years,
  children,
}: {
  designers: Designer[];
  taxonomy: Record<TaxonomyCategory, { name: string }[]>;
  years: number[];
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Selected>(emptySelected);
  const [openToWorkOnly, setOpenToWorkOnly] = useState(false);
  const [search, setSearch] = useState("");

  const toggle = (group: FilterGroup, value: string) => {
    setSelected((prev) => {
      const next: Selected = { ...prev, [group]: new Set(prev[group]) };
      if (next[group].has(value)) next[group].delete(value);
      else next[group].add(value);
      return next;
    });
  };

  const clearGroup = (group: FilterGroup) => {
    setSelected((prev) => ({ ...prev, [group]: new Set() }));
  };

  const clearAll = () => {
    setSelected(emptySelected());
    setOpenToWorkOnly(false);
    setSearch("");
  };

  const filtered = useMemo(() => {
    let result = designers;

    if (openToWorkOnly) {
      result = result.filter((d) => d.openToWork);
    }

    for (const group of TAXONOMY_CATEGORIES) {
      const sel = selected[group];
      if (sel.size > 0) {
        result = result.filter((d) => d.taxonomy[group].some((name) => sel.has(name)));
      }
    }
    if (selected.grade.size > 0) {
      result = result.filter((d) => selected.grade.has(d.grade));
    }
    if (selected.experience.size > 0) {
      result = result.filter((d) => matchesExperience(d.yearsOfExperience, selected.experience));
    }
    if (selected.program.size > 0) {
      result = result.filter((d) => d.programs.some((p) => selected.program.has(p.program)));
    }
    if (selected.year.size > 0) {
      result = result.filter((d) => d.programs.some((p) => selected.year.has(String(p.year))));
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((d) => {
        const haystack = [
          d.firstName,
          d.lastName,
          d.grade,
          ...Object.values(d.taxonomy).flat(),
          ...d.programs.map((p) => p.program),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return result;
  }, [designers, selected, search, openToWorkOnly]);

  const activeCount =
    FILTER_GROUPS.reduce((sum, group) => sum + selected[group].size, 0) +
    (search.trim() ? 1 : 0) +
    (openToWorkOnly ? 1 : 0);

  const options = useMemo(() => {
    const taxonomyNames = Object.fromEntries(
      TAXONOMY_CATEGORIES.map((category) => [
        category,
        (taxonomy[category] ?? []).map((term) => term.name),
      ]),
    ) as Record<TaxonomyCategory, string[]>;

    const programs = [...new Set(designers.flatMap((d) => d.programs.map((p) => p.program)))].sort();

    return { taxonomy: taxonomyNames, programs, years };
  }, [taxonomy, years, designers]);

  return (
    <FilterContext.Provider
      value={{
        designers,
        filtered,
        selected,
        toggle,
        clearGroup,
        clearAll,
        activeCount,
        openToWorkOnly,
        setOpenToWorkOnly,
        search,
        setSearch,
        options,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useDesignerFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useDesignerFilter must be used within DesignerFilterProvider");
  return ctx;
}
