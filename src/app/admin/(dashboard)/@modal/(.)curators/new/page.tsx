import { CuratorFormModal } from "@/components/admin/curator-form-modal";
import { createCuratorAction } from "@/lib/actions/curators";
import { parseCuratorPrefill } from "@/lib/admin/curator-new-prefill";
import { getAllTagsGrouped, getDistinctGeoValues } from "@/lib/db/tags";

export const dynamic = "force-dynamic";

// Intercepts a soft navigation to /admin/curators/new (the "Добавить портфолио"
// button, or "Опубликовать" on a submission) and shows the form in a modal over
// whatever list it was opened from.
export default async function InterceptedNewCuratorModal({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [tags, geoOptions, sp] = await Promise.all([
    getAllTagsGrouped(),
    getDistinctGeoValues(),
    searchParams,
  ]);
  const { prefill, fromSubmissionId, note } = parseCuratorPrefill(sp);

  return (
    <CuratorFormModal
      title="Добавить портфолио"
      action={createCuratorAction}
      curator={prefill}
      tags={tags}
      geoOptions={geoOptions}
      fromSubmissionId={fromSubmissionId}
      note={note}
      intercepted
    />
  );
}
