import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CuratorDetail } from "@/components/curator-detail";
import { getCuratorBySlug } from "@/lib/db/curators";

// ISR: each curator page is rendered on first visit, then cached for 5 minutes
// (admin edits purge it via revalidatePath). New slugs render on demand.
export const revalidate = 300;

export async function generateMetadata(props: PageProps<"/curator/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const curator = await getCuratorBySlug(slug);
  if (!curator) return {};

  const title = `${curator.name} — Foliodeck`;
  const description = [curator.role, "Portfolio in the Foliodeck curated gallery."].filter(Boolean).join(". ");
  return {
    title,
    description,
    openGraph: { type: "website", siteName: "Foliodeck", title, description, url: `/curator/${slug}` },
  };
}

export default async function CuratorPage(props: PageProps<"/curator/[slug]">) {
  const { slug } = await props.params;
  const curator = await getCuratorBySlug(slug);

  if (!curator) notFound();

  return <CuratorDetail curator={curator} />;
}
