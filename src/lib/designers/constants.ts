// Shared constants for the internal "Дизайн тащит" student base. Kept free of
// any DB/React imports so both server scripts and client components can use it.

export const TAXONOMY_CATEGORIES = [
  "platform",
  "business_model",
  "industry",
  "interface_type",
  "skill",
  "company_type",
] as const;

export type TaxonomyCategory = (typeof TAXONOMY_CATEGORIES)[number];

/** Section headings used in the pop-up and the Copy-profile text. */
export const CATEGORY_LABELS: Record<TaxonomyCategory, string> = {
  platform: "Платформы",
  business_model: "Бизнес-модель",
  industry: "Индустрии",
  interface_type: "Тип интерфейса",
  skill: "Сильные стороны",
  company_type: "Тип компании",
};

/** Short labels for the compact filter bar. */
export const CATEGORY_FILTER_LABELS: Record<TaxonomyCategory, string> = {
  platform: "Platform",
  business_model: "Business",
  industry: "Industry",
  interface_type: "Interface",
  skill: "Skills",
  company_type: "Company",
};

export const GRADES = [
  "Junior",
  "Junior+",
  "Middle",
  "Middle+",
  "Senior",
  "Senior+",
  "Principal",
  "Lead",
] as const;

export type Grade = (typeof GRADES)[number];

/** Seeded program names; the form lets the admin type a different one. */
export const PROGRAMS = ["Карьера", "Мобилки", "Веб"] as const;

export const LINK_TYPES = [
  "portfolio",
  "cv",
  "linkedin",
  "telegram",
  "behance",
  "dribbble",
  "figma",
] as const;

export type LinkType = (typeof LINK_TYPES)[number];

export const LINK_LABELS: Record<string, string> = {
  portfolio: "Portfolio",
  cv: "CV",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  behance: "Behance",
  dribbble: "Dribbble",
  figma: "Figma",
};

/** Experience buckets for the filter (min inclusive, max exclusive). */
export const EXPERIENCE_RANGES = [
  { id: "0-2", label: "до 2 лет", min: 0, max: 2 },
  { id: "2-4", label: "2–4 года", min: 2, max: 4 },
  { id: "4-6", label: "4–6 лет", min: 4, max: 6 },
  { id: "6+", label: "6+ лет", min: 6, max: Infinity },
] as const;

/** Order tags are listed on a grid card (industry first). Covers every category. */
export const CARD_TAG_PRIORITY: TaxonomyCategory[] = [
  "industry",
  "interface_type",
  "business_model",
  "platform",
  "skill",
  "company_type",
];
