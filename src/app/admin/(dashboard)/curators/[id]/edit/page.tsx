import { notFound } from "next/navigation";
import { CuratorForm } from "@/components/admin/curator-form";
import { updateCuratorAction } from "@/lib/actions/curators";
import { getCuratorById } from "@/lib/db/curators";
import { getDistinctGeoValues, getAllTagsGrouped } from "@/lib/db/tags";

export default async function EditCuratorPage(props: PageProps<"/admin/curators/[id]/edit">) {
  const { id } = await props.params;
  const curatorId = Number(id);
  if (!Number.isInteger(curatorId)) notFound();

  const [curator, tags, geoOptions] = await Promise.all([
    getCuratorById(curatorId),
    getAllTagsGrouped(),
    getDistinctGeoValues(),
  ]);
  if (!curator) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-medium">Редактировать портфолио</h1>
      <CuratorForm
        action={updateCuratorAction.bind(null, curatorId)}
        curator={curator}
        tags={tags}
        geoOptions={geoOptions}
      />
    </div>
  );
}
