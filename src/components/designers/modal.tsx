"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { deleteDesignerAction } from "@/lib/actions/designers";
import {
  CATEGORY_LABELS,
  LINK_LABELS,
  TAXONOMY_CATEGORIES,
} from "@/lib/designers/constants";
import { formatDesignerText } from "@/lib/designers/format";
import type { Designer } from "@/lib/designers/types";
import { XIcon } from "@/components/x-icon";
import { DesignerCarousel } from "./carousel";
import { CopyButton } from "./copy-buttons";

function pluralYears(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} года`;
  return `${n} лет`;
}

export function DesignerModal({
  designer,
  intercepted = false,
}: {
  designer: Designer;
  /** True only when rendered by the intercepting route (a card click). */
  intercepted?: boolean;
}) {
  const router = useRouter();

  const close = () => {
    // Intercepted: pop back to the grid (keeps scroll position). Page variant
    // (direct link, refresh, or the redirect after saving the edit form): go to
    // the catalog explicitly — router.back() there could land on the edit form.
    if (intercepted) router.back();
    else router.push("/designer", { scroll: false });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const images = [designer.coverImage, ...designer.images].filter(
    (src): src is string => Boolean(src),
  );
  const links = designer.links.filter((l) => l.url.trim());
  const fullName = `${designer.firstName} ${designer.lastName}`.trim();

  const pill =
    "rounded-lg bg-[#26262B] px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#3a3a42]";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm sm:p-6">
      <div className="fixed inset-0" onClick={close} aria-hidden />

      <div className="relative z-10 flex h-[100dvh] w-full max-w-[680px] flex-col overflow-hidden bg-[#161618] shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:border sm:border-white/10">
        <div className="flex shrink-0 items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-medium text-white">{fullName}</h2>
              {designer.openToWork && (
                <span className="rounded-full bg-green-400 px-2 py-0.5 text-[11px] font-medium text-black">
                  Ищет работу
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-white/50">
              {designer.grade}
              {designer.yearsOfExperience != null &&
                ` · ${pluralYears(designer.yearsOfExperience)} опыта`}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <DesignerCarousel images={images} alt={fullName} />

          <div className="mt-5 flex flex-col gap-5">
          {TAXONOMY_CATEGORIES.map((category) => {
            const values = designer.taxonomy[category];
            if (values.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="mb-2 text-[12px] uppercase tracking-wide text-white/35">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => (
                    <span
                      key={value}
                      className="rounded-full bg-white/[0.06] px-3 py-1 text-[13px] text-white/80"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {designer.programs.length > 0 && (
            <div>
              <h3 className="mb-2 text-[12px] uppercase tracking-wide text-white/35">Обучение</h3>
              <ul className="flex flex-col gap-1 text-[13px] text-white/80">
                {designer.programs.map((p, i) => (
                  <li key={i}>
                    {p.program} · поток {p.cohort} · {p.year}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {links.length > 0 && (
            <div>
              <h3 className="mb-2 text-[12px] uppercase tracking-wide text-white/35">Ссылки</h3>
              <div className="flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={link.type + link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/85 hover:bg-white/10"
                  >
                    {LINK_LABELS[link.type] ?? link.type}
                  </a>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-white/10 bg-[#161618] px-5 py-3">
          <CopyButton
            getText={() => formatDesignerText(designer)}
            idle="Скопировать информацию"
            className="rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-black transition-colors hover:bg-white/90"
          />
          <CopyButton
            getText={() =>
              `${typeof window !== "undefined" ? window.location.origin : ""}/designer/${designer.slug}`
            }
            idle="Скопировать ссылку"
            className={pill}
          />
          <Link href={`/admin/designers/${designer.id}/edit`} className={pill}>
            Редактировать
          </Link>
          <form
            action={deleteDesignerAction.bind(null, designer.id)}
            onSubmit={(e) => {
              if (!confirm(`Удалить профиль «${fullName}»?`)) e.preventDefault();
            }}
            className="ml-auto"
          >
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-red-400/80 hover:text-red-400"
            >
              Удалить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
