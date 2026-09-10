import { notFound } from "next/navigation";
import { CuratorDetail } from "@/components/curator-detail";
import { getCuratorBySlug } from "@/lib/db/curators";

// ISR: each curator page is rendered on first visit, then cached for 5 minutes
// (admin edits purge it via revalidatePath). New slugs render on demand.
export const revalidate = 300;

export default async function CuratorPage(props: PageProps<"/curator/[slug]">) {
  const { slug } = await props.params;
  const curator = await getCuratorBySlug(slug);

  if (!curator) notFound();

  return <CuratorDetail curator={curator} />;
}
