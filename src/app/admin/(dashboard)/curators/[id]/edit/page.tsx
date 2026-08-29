import { notFound } from "next/navigation";
import { CuratorFormModal } from "@/components/admin/curator-form-modal";
import { updateCuratorAction } from "@/lib/actions/curators";
import { getCuratorById } from "@/lib/db/curators";
import { getAllTagsGrouped, getDistinctGeoValues } from "@/lib/db/tags";

// Direct visit / refresh of the edit URL (no list underneath to intercept over) —
// render the same modal; closing it goes to /admin.
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
    <CuratorFormModal
      title="Редактировать портфолио"
      action={updateCuratorAction.bind(null, curatorId)}
      curator={curator}
      tags={tags}
      geoOptions={geoOptions}
    />
  );
}
