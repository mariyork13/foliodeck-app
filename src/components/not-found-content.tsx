"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

const COPY = {
  en: {
    title: "This page doesn't exist",
    body: "The link may be outdated, or the portfolio was removed from the gallery.",
    cta: "Back to gallery",
  },
  ru: {
    title: "Такой страницы нет",
    body: "Возможно, ссылка устарела или портфолио убрали из галереи.",
    cta: "Вернуться в галерею",
  },
};

const pillBg = "bg-[#26262B]/70 backdrop-blur-[74px] transition-colors hover:bg-[#4D4D55]/70 max-lg:active:bg-[#4D4D55]/70";

export function NotFoundContent() {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 pt-4">
        <Link href="/" className={`inline-block rounded-lg px-4 py-2.5 text-[13px] font-medium text-white ${pillBg}`}>
          Foliodeck
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <svg width="56" height="56" viewBox="8 8 48 48" fill="none" aria-hidden className="mb-8">
          <path
            d="M8 52C8 54.2091 9.79086 56 12 56H31.8788C32.9396 56 33.9571 55.5786 34.7072 54.8284L54.8284 34.7072C55.5786 33.9571 56 32.9396 56 31.8788V12C56 9.79086 54.2091 8 52 8H32.1212C31.0604 8 30.0429 8.42143 29.2928 9.17157L9.17157 29.2928C8.42143 30.0429 8 31.0603 8 32.1212V52Z"
            fill="white"
            fillOpacity="0.9"
          />
        </svg>
        <p className="text-[96px] font-medium leading-none tracking-tight text-white/90 sm:text-[140px]">404</p>
        <h1 className="mt-6 text-[22px] font-medium text-white/90">{copy.title}</h1>
        <p className="mt-3 max-w-sm text-base text-white/50">{copy.body}</p>
        <Link
          href="/"
          className="mt-10 rounded-lg border border-[#C6CDD3]/[0.26] bg-white/90 px-5 py-[11px] text-[13px] font-medium text-black transition-colors hover:bg-white"
        >
          {copy.cta}
        </Link>
      </main>
    </div>
  );
}
