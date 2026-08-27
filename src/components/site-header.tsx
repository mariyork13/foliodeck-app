"use client";

import Link from "next/link";
import { useState } from "react";
import { roleFilters } from "@/lib/curators";
import { useFilter } from "@/lib/filter-context";
import { TEXT_SCALE } from "@/lib/scale";

const pillBg = "bg-[rgba(38,38,43,0.7)] backdrop-blur-md";
const searchBg = "bg-[rgba(38,38,43,0.7)] backdrop-blur-md border border-white/[0.04]";

const HEADER_H = "h-24";
const ROW_H = "h-12";
const TEXT = TEXT_SCALE;
const PAD_X_SM = "px-5";
const PAD_X_LG = "px-7";
const GAP_SM = "gap-5";

export function SiteHeader() {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { active, setActive } = useFilter();

  return (
    <header className="sticky top-0 z-50">
      <div className={`mx-auto flex ${HEADER_H} max-w-[1920px] items-center gap-4 px-5 sm:px-6`}>
        <div className={`flex ${ROW_H} shrink-0 items-center`}>
          <Link
            href="/"
            className={`flex h-full items-center rounded-lg ${PAD_X_SM} ${TEXT} font-medium text-white ${pillBg}`}
          >
            Foliodeck
          </Link>
          <nav className={`hidden h-full items-center ${GAP_SM} rounded-full ${PAD_X_SM} sm:flex ${pillBg}`}>
            <Link href="/about" className={`${TEXT} font-medium text-white`}>
              Проект
            </Link>
            <Link href="/founder" className={`${TEXT} font-medium text-white`}>
              Куратор
            </Link>
          </nav>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className={`relative ${ROW_H} w-full max-w-[535px] rounded-lg ${searchBg}`}>
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск"
              className={`h-full w-full rounded-lg bg-transparent pl-8 pr-8 ${TEXT} text-white placeholder:text-white/40 focus:outline-none`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Очистить поиск"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={`relative ml-auto flex ${ROW_H} shrink-0 items-center`}>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`h-full rounded-full ${PAD_X_LG} ${TEXT} font-medium text-white ${pillBg}`}
          >
            Фильтры
          </button>
          <button className={`hidden h-full rounded-lg ${PAD_X_LG} ${TEXT} font-medium text-white sm:block ${pillBg}`}>
            Избранное
          </button>
          <button
            className={`h-full rounded-full bg-white/90 backdrop-blur-md ${PAD_X_LG} ${TEXT} font-medium text-black/90`}
          >
            Отправить
          </button>

          {filtersOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setFiltersOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-xl border border-white/10 bg-[#1e1e21] p-2 shadow-xl">
                {roleFilters.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setActive(role);
                      setFiltersOpen(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      active === role ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
