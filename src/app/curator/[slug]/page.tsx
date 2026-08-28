import { notFound } from "next/navigation";
import { CuratorDetail } from "@/components/curator-detail";
import { getCuratorBySlug } from "@/lib/db/curators";

export default async function CuratorPage(props: PageProps<"/curator/[slug]">) {
  const { slug } = await props.params;
  const curator = await getCuratorBySlug(slug);

  if (!curator) notFound();

  return <CuratorDetail curator={curator} />;
}
