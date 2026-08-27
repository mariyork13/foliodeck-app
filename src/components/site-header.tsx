"use client";

import Link from "next/link";
import { useState } from "react";
import { roleFilters } from "@/lib/curators";
import { useFilter } from "@/lib/filter-context";
import { TEXT_SCALE } from "@/lib/scale";
import { FavoritesPanel } from "./favorites-panel";

const pillBgStatic = "bg-[#26262B]/70 backdrop-blur-[74px]";
const pillBg = `${pillBgStatic} transition-colors hover:bg-[#4D4D55]/70`;
const searchBg = "bg-[#26262B]/70 backdrop-blur-[74px] border border-white/[0.04]";
const submitBg = "bg-white/90 backdrop-blur-[74px] border border-[#C6CDD3]/[0.26]";

const TEXT = TEXT_SCALE;
const PAD_BTN = "px-[14px] py-3";

export function SiteHeader() {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const { active, setActive } = useFilter();

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto flex max-w-[1920px] items-center gap-4 px-4 pb-4 pt-4">
        <div className="flex shrink-0 items-center">
          <Link href="/" className={`rounded-lg ${PAD_BTN} ${TEXT} font-medium text-white ${pillBg}`}>
            Foliodeck
          </Link>
          <nav className={`hidden sm:flex items-center rounded-full ${pillBgStatic}`}>
            <Link
              href="/about"
              className={`rounded-full ${PAD_BTN} ${TEXT} font-medium text-white transition-colors hover:bg-white/10`}
            >
              Проект
            </Link>
            <Link
              href="/founder"
              className={`rounded-full ${PAD_BTN} ${TEXT} font-medium text-white transition-colors hover:bg-white/10`}
            >
              Куратор
            </Link>
          </nav>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className={`relative h-11 w-full max-w-[416px] rounded-lg ${searchBg}`}>
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

        <div className="relative ml-auto flex shrink-0 items-center">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`rounded-full ${PAD_BTN} ${TEXT} font-medium text-white ${pillBg}`}
          >
            Фильтры
          </button>
          <button
            onClick={() => setFavoritesOpen(true)}
            className={`hidden rounded-lg ${PAD_BTN} ${TEXT} font-medium text-white sm:block ${pillBg}`}
          >
            Избранное
          </button>
          <button className={`rounded-full ${submitBg} ${PAD_BTN} ${TEXT} font-medium text-black/90`}>
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

      <FavoritesPanel open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </header>
  );
}
