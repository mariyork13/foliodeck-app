import Link from "next/link";
import {
  createTaxonomyTermAction,
  deleteTaxonomyTermAction,
  renameTaxonomyTermAction,
} from "@/lib/actions/taxonomy";
import { CATEGORY_LABELS, TAXONOMY_CATEGORIES, type TaxonomyCategory } from "@/lib/designers/constants";
import { getTaxonomyGroupedWithUsage } from "@/lib/db/taxonomy";

export const dynamic = "force-dynamic";

async function createFromForm(category: TaxonomyCategory, formData: FormData): Promise<void> {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await createTaxonomyTermAction(category, name);
}

export default async function TaxonomyPage() {
  const grouped = await getTaxonomyGroupedWithUsage();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Справочники дизайнеров</h1>
        <Link href="/designer" className="text-sm text-white/60 hover:text-white">
          ← К базе
        </Link>
      </div>

      {TAXONOMY_CATEGORIES.map((category) => (
        <div key={category}>
          <h2 className="mb-3 text-lg font-medium text-white/90">{CATEGORY_LABELS[category]}</h2>
          <ul className="mb-4 flex flex-col gap-2">
            {grouped[category].map((term) => (
              <li
                key={term.id}
                className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm"
              >
                <form
                  action={renameTaxonomyTermAction.bind(null, term.id)}
                  className="flex flex-1 items-center gap-2"
                >
                  <input
                    name="name"
                    defaultValue={term.name}
                    className="flex-1 rounded bg-white/10 px-2 py-1 text-white outline-none"
                  />
                  <button type="submit" className="text-white/60 hover:text-white">
                    Переименовать
                  </button>
                </form>
                <span className="text-white/40">{term.usageCount}×</span>
                <form action={deleteTaxonomyTermAction.bind(null, term.id)}>
                  <button type="submit" className="text-red-400/80 hover:text-red-400">
                    Удалить
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createFromForm.bind(null, category)} className="flex max-w-sm gap-2">
            <input
              name="name"
              placeholder={`Добавить в «${CATEGORY_LABELS[category]}»`}
              className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
            >
              Добавить
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
