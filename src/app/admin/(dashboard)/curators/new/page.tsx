import { CuratorFormModal } from "@/components/admin/curator-form-modal";
import { createCuratorAction } from "@/lib/actions/curators";
import { parseCuratorPrefill } from "@/lib/admin/curator-new-prefill";
import { getAllTagsGrouped, getDistinctGeoValues, getDistinctRoleValues } from "@/lib/db/tags";

export const dynamic = "force-dynamic";

// Direct visit / refresh of /admin/curators/new — render the same modal; closing
// it goes to /admin.
export default async function NewCuratorPage(props: PageProps<"/admin/curators/new">) {
  const [tags, geoOptions, roleOptions, sp] = await Promise.all([
    getAllTagsGrouped(),
    getDistinctGeoValues(),
    getDistinctRoleValues(),
    props.searchParams,
  ]);
  const { prefill, fromSubmissionId, note } = parseCuratorPrefill(sp);

  return (
    <CuratorFormModal
      title="Добавить портфолио"
      action={createCuratorAction}
      curator={prefill}
      tags={tags}
      geoOptions={geoOptions}
      roleOptions={roleOptions}
      fromSubmissionId={fromSubmissionId}
      note={note}
    />
  );
}
