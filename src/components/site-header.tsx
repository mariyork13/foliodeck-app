"use client";

import Link from "next/link";
import { useState } from "react";

const pillBg = "bg-[#26262b]/70";
const searchBg = "bg-[#26262b]/70 border border-white/[0.04]";

export function SiteHeader() {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-[#161618]">
      <div className="mx-auto flex h-[108px] max-w-[1920px] items-center gap-4 px-5 sm:px-6">
        <div className="flex h-[57px] shrink-0 items-center">
          <Link href="/" className={`flex h-full items-center rounded-lg px-5 text-xs font-medium text-white ${pillBg}`}>
            Foliodeck
          </Link>
          <nav className={`hidden h-full items-center gap-5 rounded-full px-5 sm:flex ${pillBg}`}>
            <Link href="/about" className="text-xs font-medium text-white">
              Проект
            </Link>
            <Link href="/founder" className="text-xs font-medium text-white">
              Куратор
            </Link>
          </nav>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className={`relative h-[57px] w-full max-w-[535px] rounded-lg ${searchBg}`}>
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
              className="h-full w-full rounded-lg bg-transparent pl-8 pr-8 text-xs text-white placeholder:text-white/40 focus:outline-none"
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

        <div className="ml-auto flex h-[57px] shrink-0 items-center">
          <button className={`h-full rounded-full px-7 text-xs font-medium text-white ${pillBg}`}>
            Фильтры
          </button>
          <button className={`hidden h-full rounded-lg px-7 text-xs font-medium text-white sm:block ${pillBg}`}>
            Избранное
          </button>
          <button className="h-full rounded-full bg-white/90 px-7 text-xs font-medium text-black/90">
            Отправить
          </button>
        </div>
      </div>
    </header>
  );
}
