import { CuratorForm } from "@/components/admin/curator-form";
import { createCuratorAction } from "@/lib/actions/curators";
import type { CuratorRecord } from "@/lib/db/curators";
import { getDistinctGeoValues, getAllTagsGrouped } from "@/lib/db/tags";
import { slugify } from "@/lib/designers/slug";

export const dynamic = "force-dynamic";

export default async function NewCuratorPage(props: PageProps<"/admin/curators/new">) {
  const [tags, geoOptions] = await Promise.all([getAllTagsGrouped(), getDistinctGeoValues()]);

  const sp = await props.searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
  const name = str(sp.name);
  const fromId = Number(str(sp.from));
  const fromSubmission = Number.isInteger(fromId) && fromId > 0;

  const prefill: Partial<CuratorRecord> | undefined = name
    ? {
        name,
        slug: slugify(name),
        role: str(sp.role),
        externalUrl: str(sp.url),
      }
    : undefined;

  return (
    <div>
      <h1 className="mb-6 text-xl font-medium">Добавить портфолио</h1>
      {fromSubmission && (
        <p className="mb-6 text-sm text-white/50">
          Данные подставлены из заявки #{fromId}. Добавьте обложку и сохраните — заявка отметится как
          «Опубликовано».
        </p>
      )}
      <CuratorForm
        action={createCuratorAction}
        curator={prefill}
        tags={tags}
        geoOptions={geoOptions}
        fromSubmissionId={fromSubmission ? fromId : undefined}
      />
    </div>
  );
}
