"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFilter } from "@/lib/filter-context";
import type { Curator, FilterOptions } from "@/lib/types";
import { FavoritesPanel } from "./favorites-panel";
import { FiltersPanel } from "./filters-panel";
import { FilterIcon, HeartIcon, SearchIcon } from "./icons";
import { SubmitModal } from "./submit-modal";
import { XIcon } from "./x-icon";

const clearBadge = "flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white";

const pillBgStatic = "bg-[#26262B]/70 backdrop-blur-[74px]";
// `max-lg:active:` gives touch devices (mobile + tablet) a pressed-state colour
// change, since there's no hover there.
const pillBg = `${pillBgStatic} transition-colors hover:bg-[#4D4D55]/70 max-lg:active:bg-[#4D4D55]/70`;
const searchBg = "bg-[#26262B]/70 backdrop-blur-[74px] border border-white/[0.04]";
const submitBg = "bg-white/90 backdrop-blur-[74px] border border-[#C6CDD3]/[0.26]";

const TEXT = "text-[13px]";
const PAD_BTN = "px-4 py-2.5";
// 1px border on the search box and Submit button eats into their box height
// relative to the borderless pills, so they get 1px less padding to match.
const PAD_BTN_BORDERED = "px-4 py-[9px]";
const CLOSE_DELAY = 200;

export function SiteHeader({ curators, filterOptions }: { curators: Curator[]; filterOptions: FilterOptions }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { selected, reset, search, setSearch } = useFilter();
  const filterCount = Object.values(selected).reduce((sum, set) => sum + set.size, 0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNavOpen(false), [pathname]);

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
          <button
            onClick={() => setSubmitOpen(true)}
            className={`rounded-full sm:hidden ${submitBg} ${PAD_BTN_BORDERED} ${TEXT} font-medium text-black/90`}
          >
            Submit
          </button>
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

        {/* Tablet: a normal flex item that shrinks between the two button
            groups, keeping a 16px gap via the row's own gap-4. */}
        <div className="hidden min-w-0 flex-1 md:flex lg:hidden">
          <SearchBox search={search} setSearch={setSearch} className="w-full" />
        </div>

        {/* Desktop: centered on the full header width regardless of how
            wide the button groups on either side are. */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
          <SearchBox search={search} setSearch={setSearch} className="pointer-events-auto w-full max-w-[416px]" />
        </div>

        <div className="ml-auto flex shrink-0 items-center">
          <div onMouseEnter={openFilters} onMouseLeave={scheduleCloseFilters}>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex h-[39.5px] items-center justify-center gap-2 rounded-full ${TEXT} font-medium text-white ${pillBg} ${filterCount > 0 ? "px-3" : "w-[39.5px]"} sm:h-auto sm:w-auto sm:justify-start sm:px-4 sm:py-2.5`}
            >
              <FilterIcon className="shrink-0 sm:hidden" />
              {filterCount > 0 && <span className="sm:hidden">{filterCount}</span>}
              <span className="hidden sm:inline">{filterCount > 0 ? `Filter ${filterCount}` : "Filters"}</span>
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
          {filtersOpen && (
            <FiltersPanel onMouseEnter={openFilters} onMouseLeave={scheduleCloseFilters} options={filterOptions} />
          )}
          <button
            onClick={() => setFavoritesOpen(true)}
            className={`flex h-[39.5px] w-[39.5px] items-center justify-center gap-2 rounded-lg ${TEXT} font-medium text-white ${pillBg} sm:h-auto sm:w-auto sm:justify-start sm:px-4 sm:py-2.5`}
          >
            <HeartIcon className="sm:hidden" />
            <span className="hidden sm:inline">Favorites</span>
          </button>

          {/* Mobile: nav links (Project/Curator) collapse behind a hamburger button,
              placed last so it sits at the outer edge of the icon cluster. */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Menu"
              className={`flex h-[39.5px] w-[39.5px] items-center justify-center rounded-full ${TEXT} font-medium text-white ${pillBg}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            {navOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNavOpen(false)} />
                <div
                  className={`absolute right-0 top-[calc(100%+8px)] z-50 flex w-40 flex-col overflow-hidden rounded-xl ${pillBgStatic} backdrop-blur-[74px]`}
                >
                  <Link
                    href="/about"
                    onClick={() => setNavOpen(false)}
                    className={`${PAD_BTN} ${TEXT} font-medium text-white transition-colors hover:bg-white/10`}
                  >
                    Project
                  </Link>
                  <Link
                    href="/founder"
                    onClick={() => setNavOpen(false)}
                    className={`${PAD_BTN} ${TEXT} font-medium text-white transition-colors hover:bg-white/10`}
                  >
                    Curator
                  </Link>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setSubmitOpen(true)}
            className={`hidden rounded-full sm:block ${submitBg} ${PAD_BTN_BORDERED} ${TEXT} font-medium text-black/90`}
          >
            Submit
          </button>
        </div>
      </div>

      <FavoritesPanel open={favoritesOpen} onClose={() => setFavoritesOpen(false)} curators={curators} />
      {submitOpen && (
        <SubmitModal
          open
          onClose={() => setSubmitOpen(false)}
          specializations={filterOptions.specializations}
        />
      )}
    </header>
  );
}

function SearchBox({
  search,
  setSearch,
  className,
}: {
  search: string;
  setSearch: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 rounded-lg ${searchBg} ${className ?? ""}`}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Find a designer, company or industry..."
        className={`w-full rounded-lg bg-transparent py-[9px] pl-8 pr-8 ${TEXT} text-white placeholder:text-white focus:outline-none`}
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          aria-label="Clear search"
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${clearBadge}`}
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}
