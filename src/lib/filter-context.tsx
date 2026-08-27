"use client";

import { createContext, useContext, useState } from "react";
import { roleFilters } from "@/lib/curators";

type Role = (typeof roleFilters)[number];

type FilterContextValue = {
  active: Role;
  setActive: (role: Role) => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<Role>("Все");
  return <FilterContext.Provider value={{ active, setActive }}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within a FilterProvider");
  return ctx;
}
