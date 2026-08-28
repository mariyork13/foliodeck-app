import { CuratorForm } from "@/components/admin/curator-form";
import { createCuratorAction } from "@/lib/actions/curators";
import { getDistinctGeoValues, getAllTagsGrouped } from "@/lib/db/tags";

export const dynamic = "force-dynamic";

export default async function NewCuratorPage() {
  const [tags, geoOptions] = await Promise.all([getAllTagsGrouped(), getDistinctGeoValues()]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-medium">Добавить портфолио</h1>
      <CuratorForm action={createCuratorAction} tags={tags} geoOptions={geoOptions} />
    </div>
  );
}
