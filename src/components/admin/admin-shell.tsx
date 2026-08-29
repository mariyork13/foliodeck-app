"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";

type NavItem = { href: string; label: string; match: (pathname: string) => boolean };

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Портфолио",
    match: (p) => p === "/admin" || p.startsWith("/admin/curators"),
  },
  {
    href: "/admin/submissions",
    label: "Заявки",
    match: (p) => p.startsWith("/admin/submissions"),
  },
  {
    href: "/designer",
    label: "Выпускники",
    match: (p) => p === "/designer" || p.startsWith("/designer/") || p.startsWith("/admin/designers"),
  },
  {
    href: "/admin/taxonomy",
    label: "Теги выпускников",
    match: (p) => p.startsWith("/admin/taxonomy"),
  },
  {
    href: "/admin/tags",
    label: "Теги портфолио",
    match: (p) => p.startsWith("/admin/tags"),
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex min-h-screen bg-[#161618] text-white max-md:flex-col">
      <aside className="flex shrink-0 flex-col gap-1 border-white/10 p-3 md:sticky md:top-0 md:h-screen md:w-52 md:border-r max-md:flex-row max-md:overflow-x-auto max-md:border-b">
        <div className="mb-3 px-3 py-1 text-sm font-medium text-white/90 max-md:hidden">Школа ДТ</div>

        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-white/10 font-medium text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <form action={logoutAction} className="mt-auto max-md:ml-auto">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/50 hover:bg-white/5 hover:text-white"
          >
            Выйти
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
