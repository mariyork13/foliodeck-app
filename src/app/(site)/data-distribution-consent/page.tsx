"use client";

import { useLanguage } from "@/lib/language-context";

const TITLE = {
  ru: "Согласие на распространение персональных данных",
  en: "Consent to the Distribution of Personal Data",
};
const BODY = {
  ru: "Текст согласия будет добавлен здесь.",
  en: "The consent text will be added here.",
};

export default function DataDistributionConsentPage() {
  const { language } = useLanguage();

  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-4 sm:pt-16">
      <h1 className="mb-6 text-[22px] font-medium text-white/90">{TITLE[language]}</h1>
      <div className="space-y-4 text-base text-white/60">
        <p>{BODY[language]}</p>
      </div>
    </article>
  );
}
