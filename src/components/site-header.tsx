"use client";

import Link from "next/link";
import { useState } from "react";
import { TEXT_SCALE } from "@/lib/scale";
import { FavoritesPanel } from "./favorites-panel";
import { FiltersPanel } from "./filters-panel";

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

        <div className="ml-auto flex shrink-0 items-center">
          <div
            className="relative"
            onMouseEnter={() => setFiltersOpen(true)}
            onMouseLeave={() => setFiltersOpen(false)}
          >
            <button className={`rounded-full ${PAD_BTN} ${TEXT} font-medium text-white ${pillBg}`}>
              Фильтры
            </button>
            {filtersOpen && <FiltersPanel />}
          </div>
          <button
            onClick={() => setFavoritesOpen(true)}
            className={`hidden rounded-lg ${PAD_BTN} ${TEXT} font-medium text-white sm:block ${pillBg}`}
          >
            Избранное
          </button>
          <button className={`rounded-full ${submitBg} ${PAD_BTN} ${TEXT} font-medium text-black/90`}>
            Отправить
          </button>
        </div>
      </div>

      <FavoritesPanel open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </header>
  );
}
