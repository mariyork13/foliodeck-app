"use client";

import { createContext, useContext, useState } from "react";

export type FilterGroup = "specialization" | "company" | "geo" | "collections";

type FilterContextValue = {
  selected: Record<FilterGroup, Set<string>>;
  toggle: (group: FilterGroup, value: string) => void;
  reset: () => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

const empty = (): Record<FilterGroup, Set<string>> => ({
  specialization: new Set(),
  company: new Set(),
  geo: new Set(),
  collections: new Set(),
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState(empty);

  const toggle = (group: FilterGroup, value: string) => {
    setSelected((prev) => {
      const next = { ...prev, [group]: new Set(prev[group]) };
      if (next[group].has(value)) next[group].delete(value);
      else next[group].add(value);
      return next;
    });
  };

  const reset = () => setSelected(empty());

  return <FilterContext.Provider value={{ selected, toggle, reset }}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within a FilterProvider");
  return ctx;
}
