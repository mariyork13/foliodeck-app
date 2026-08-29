import { createTag, deleteTagAction, renameTagAction, type TagType } from "@/lib/actions/tags";
import { getAllTagsGroupedWithUsage } from "@/lib/db/tags";

const SECTIONS: { type: TagType; title: string }[] = [
  { type: "specialization", title: "Направление" },
  { type: "company", title: "Компания" },
  { type: "collection", title: "Коллекции" },
];

export const dynamic = "force-dynamic";

async function createTagAction(type: TagType, formData: FormData): Promise<void> {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await createTag(type, name);
}

export default async function AdminTagsPage() {
  const grouped = await getAllTagsGroupedWithUsage();

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-xl font-medium">Теги портфолио</h1>
      {SECTIONS.map((section) => (
        <div key={section.type}>
          <h2 className="mb-3 text-lg font-medium text-white/90">{section.title}</h2>
          <ul className="mb-4 flex flex-col gap-2">
            {grouped[section.type].map((tag) => (
              <li key={tag.id} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
                <form action={renameTagAction.bind(null, tag.id)} className="flex flex-1 items-center gap-2">
                  <input
                    name="name"
                    defaultValue={tag.name}
                    className="flex-1 rounded bg-white/10 px-2 py-1 text-white outline-none"
                  />
                  <button type="submit" className="text-white/60 hover:text-white">
                    Переименовать
                  </button>
                </form>
                <span className="text-white/40">{tag.usageCount}×</span>
                <form action={deleteTagAction.bind(null, tag.id)}>
                  <button type="submit" className="text-red-400/80 hover:text-red-400">
                    Удалить
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createTagAction.bind(null, section.type)} className="flex max-w-sm gap-2">
            <input
              name="name"
              placeholder={`Добавить в «${section.title}»`}
              className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button type="submit" className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20">
              Добавить
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
