import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "aurora-branding",
    title: "Aurora",
    client: "Aurora Skincare",
    category: "Branding",
    year: 2025,
    gradient: "from-rose-200 via-orange-100 to-amber-200",
    description:
      "Identity system and packaging for a minimalist skincare line, built around soft gradients and a custom wordmark.",
    imageCount: 5,
  },
  {
    slug: "northbank-web",
    title: "Northbank",
    client: "Northbank Studio",
    category: "Web Design",
    year: 2025,
    gradient: "from-slate-800 via-slate-700 to-slate-900",
    description:
      "A dark, editorial marketing site for an architecture studio, with a slow-scroll project showcase.",
    imageCount: 4,
  },
  {
    slug: "lumen-app",
    title: "Lumen",
    client: "Lumen Health",
    category: "UI/UX",
    year: 2024,
    gradient: "from-emerald-200 via-teal-100 to-cyan-200",
    description:
      "End-to-end UX for a sleep-tracking app, from onboarding flows to a redesigned insights dashboard.",
    imageCount: 6,
  },
  {
    slug: "wildflower-photography",
    title: "Wildflower",
    client: "Personal work",
    category: "Photography",
    year: 2024,
    gradient: "from-lime-200 via-yellow-100 to-emerald-100",
    description: "A series shot across three seasons documenting wild meadows at golden hour.",
    imageCount: 8,
  },
  {
    slug: "fablecraft-illustration",
    title: "Fablecraft",
    client: "Fablecraft Publishing",
    category: "Illustration",
    year: 2024,
    gradient: "from-fuchsia-200 via-purple-100 to-indigo-200",
    description: "Cover illustrations and interior spot art for a children's book anthology.",
    imageCount: 5,
  },
  {
    slug: "harbor-web",
    title: "Harbor",
    client: "Harbor Goods",
    category: "Web Design",
    year: 2023,
    gradient: "from-sky-200 via-blue-100 to-indigo-100",
    description: "An e-commerce experience for a coastal homeware brand with a custom product configurator.",
    imageCount: 4,
  },
  {
    slug: "monochrome-branding",
    title: "Monochrome",
    client: "Studio Onyx",
    category: "Branding",
    year: 2023,
    gradient: "from-zinc-300 via-neutral-200 to-stone-300",
    description: "A restrained black-and-white identity for a furniture design studio.",
    imageCount: 5,
  },
  {
    slug: "citylight-photography",
    title: "Citylight",
    client: "Personal work",
    category: "Photography",
    year: 2023,
    gradient: "from-indigo-300 via-violet-200 to-pink-200",
    description: "Long-exposure night photography exploring the neon glow of downtown streets.",
    imageCount: 7,
  },
  {
    slug: "orbit-app",
    title: "Orbit",
    client: "Orbit Finance",
    category: "UI/UX",
    year: 2022,
    gradient: "from-amber-200 via-orange-100 to-rose-100",
    description: "A budgeting app redesign focused on clarity, with a new data-visualization language.",
    imageCount: 6,
  },
];

export const categories = [
  "All",
  "Branding",
  "Web Design",
  "UI/UX",
  "Photography",
  "Illustration",
] as const;

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
