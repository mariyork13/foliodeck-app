"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useFilter } from "@/lib/filter-context";
import { TEXT_SCALE } from "@/lib/scale";
import { FavoritesPanel } from "./favorites-panel";
import { FiltersPanel } from "./filters-panel";
import { XIcon } from "./x-icon";

const pillBgStatic = "bg-[#26262B]/70 backdrop-blur-[74px]";
const pillBg = `${pillBgStatic} transition-colors hover:bg-[#4D4D55]/70`;
const searchBg = "bg-[#26262B]/70 backdrop-blur-[74px] border border-white/[0.04]";
const submitBg = "bg-white/90 backdrop-blur-[74px] border border-[#C6CDD3]/[0.26]";

const TEXT = TEXT_SCALE;
const PAD_BTN = "px-5 py-3";
const CLOSE_DELAY = 200;

export function SiteHeader() {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const { selected, reset } = useFilter();
  const filterCount = Object.values(selected).reduce((sum, set) => sum + set.size, 0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openFilters = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setFiltersOpen(true);
  };
  const scheduleCloseFilters = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setFiltersOpen(false), CLOSE_DELAY);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="relative mx-auto flex max-w-[1920px] items-center gap-4 px-4 pb-4 pt-4">
        <div className="flex shrink-0 items-center">
          <Link href="/" className={`rounded-lg ${PAD_BTN} ${TEXT} font-medium text-white ${pillBg}`}>
            Foliodeck
          </Link>
          <nav className={`hidden sm:flex items-center rounded-full ${pillBgStatic}`}>
            <Link
              href="/about"
              className={`rounded-full ${PAD_BTN} ${TEXT} font-medium text-white transition-colors hover:bg-white/10`}
            >
              Project
            </Link>
            <Link
              href="/founder"
              className={`rounded-full ${PAD_BTN} ${TEXT} font-medium text-white transition-colors hover:bg-white/10`}
            >
              Curator
            </Link>
          </nav>
        </div>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <div className={`pointer-events-auto relative h-11 w-full max-w-[416px] rounded-lg ${searchBg}`}>
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
              placeholder="Find a designer, company or industry..."
              className={`h-full w-full rounded-lg bg-transparent pl-8 pr-8 ${TEXT} text-white placeholder:text-white focus:outline-none`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
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
          <div onMouseEnter={openFilters} onMouseLeave={scheduleCloseFilters}>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-full ${PAD_BTN} ${TEXT} font-medium text-white ${pillBg}`}
            >
              {filterCount > 0 ? `Filter ${filterCount}` : "Filters"}
              {filterCount > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                >
                  <XIcon />
                </span>
              )}
            </button>
          </div>
          {filtersOpen && <FiltersPanel onMouseEnter={openFilters} onMouseLeave={scheduleCloseFilters} />}
          <button
            onClick={() => setFavoritesOpen(true)}
            className={`hidden rounded-lg ${PAD_BTN} ${TEXT} font-medium text-white sm:block ${pillBg}`}
          >
            Favorites
          </button>
          <button className={`rounded-full ${submitBg} ${PAD_BTN} ${TEXT} font-medium text-black/90`}>
            Submit
          </button>
        </div>
      </div>

      <FavoritesPanel open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </header>
  );
}
