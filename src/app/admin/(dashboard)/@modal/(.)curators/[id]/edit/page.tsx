import { notFound } from "next/navigation";
import { CuratorFormModal } from "@/components/admin/curator-form-modal";
import { updateCuratorAction } from "@/lib/actions/curators";
import { getCuratorById } from "@/lib/db/curators";
import { getAllTagsGrouped, getDistinctGeoValues } from "@/lib/db/tags";

export const dynamic = "force-dynamic";

// Intercepts a soft navigation to /admin/curators/[id]/edit (an "Изменить" click
// in the list) and shows the form in a modal over the list, so its scroll
// position survives the edit.
export default async function InterceptedEditCuratorModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      intercepted
    />
  );
}
