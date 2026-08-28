"use client";

import { useState, useTransition } from "react";
import { createTaxonomyTermAction } from "@/lib/actions/taxonomy";
import type { TaxonomyCategory } from "@/lib/designers/constants";

type Term = { id: number; name: string };

// Multiselect chips + inline "create" for one taxonomy category. Selected ids
// are submitted as repeated hidden inputs named `taxonomyIds`.
export function TaxonomyPicker({
  category,
  label,
  options: initialOptions,
  defaultSelectedIds = [],
}: {
  category: TaxonomyCategory;
  label: string;
  options: Term[];
  defaultSelectedIds?: number[];
}) {
  const [options, setOptions] = useState(initialOptions);
  const [selected, setSelected] = useState(new Set(defaultSelectedIds));
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const q = query.trim().toLowerCase();
  const filtered = options.filter((o) => o.name.toLowerCase().includes(q));
  const exactMatch = options.some((o) => o.name.toLowerCase() === q);

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    startTransition(async () => {
      const term = await createTaxonomyTermAction(category, name);
      setOptions((prev) =>
        prev.some((o) => o.id === term.id) ? prev : [...prev, { id: term.id, name: term.name }],
      );
      setSelected((prev) => new Set(prev).add(term.id));
      setQuery("");
    });
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Искать или добавить: ${label.toLowerCase()}…`}
        className="mb-2 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
      />
      {query.trim() && !exactMatch && (
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="mb-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-50"
        >
          {isPending ? "Добавляем…" : `+ Создать «${query.trim()}»`}
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        {filtered.map((option) => {
          const checked = selected.has(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                checked ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {option.name}
              <input type="hidden" name="taxonomyIds" value={option.id} disabled={!checked} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
