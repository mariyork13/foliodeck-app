"use client";

import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { useDesignerFilter } from "@/lib/designers/filter-context";
import { DesignerFilterBar } from "./filter-bar";
import { DesignerFilterChips } from "./filter-chips";
import { DesignerSearchBox } from "./search-box";

const pillBg = "bg-[#26262B]/70 backdrop-blur-[74px]";
const pill = `${pillBg} transition-colors hover:bg-[#4D4D55]/70`;
const TEXT = "text-[13px]";

export function DesignerHeader() {
  const { filtered, designers } = useDesignerFilter();

  return (
    <header className="sticky top-0 z-40 bg-[#161618]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1920px] px-4 pb-3 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/designer" className={`shrink-0 rounded-lg px-4 py-2.5 ${TEXT} font-medium text-white ${pill}`}>
            Дизайн тащит
          </Link>

          <div className="order-last w-full min-w-0 md:order-none md:w-auto md:flex-1">
            <DesignerSearchBox />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              href="/admin/taxonomy"
              className={`rounded-lg px-4 py-2.5 ${TEXT} font-medium text-white ${pill}`}
            >
              Справочники
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className={`rounded-lg px-4 py-2.5 ${TEXT} font-medium text-white ${pill}`}
              >
                Выйти
              </button>
            </form>
            <Link
              href="/admin/designers/new"
              className={`rounded-full border border-[#C6CDD3]/[0.26] bg-white/90 px-4 py-[9px] ${TEXT} font-medium text-black/90 backdrop-blur-[74px]`}
            >
              + Добавить
            </Link>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <DesignerFilterBar />
          <span className="text-[13px] text-white/40">
            {filtered.length === designers.length
              ? `${designers.length} дизайнеров`
              : `${filtered.length} из ${designers.length}`}
          </span>
        </div>

        <DesignerFilterChips />
      </div>
    </header>
  );
}
