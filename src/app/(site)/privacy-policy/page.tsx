"use client";

import { useLanguage } from "@/lib/language-context";

const TITLE = { ru: "Политика обработки персональных данных", en: "Privacy Policy" };
const BODY = {
  ru: "Текст политики будет добавлен здесь.",
  en: "The policy text will be added here.",
};

export default function PrivacyPolicyPage() {
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
