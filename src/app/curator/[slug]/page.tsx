import { notFound } from "next/navigation";
import { CuratorDetail } from "@/components/curator-detail";
import { curators } from "@/lib/curators";

export default async function CuratorPage(props: PageProps<"/curator/[slug]">) {
  const { slug } = await props.params;
  const curator = curators.find((c) => c.slug === slug);

  if (!curator) notFound();

  return <CuratorDetail curator={curator} />;
}
