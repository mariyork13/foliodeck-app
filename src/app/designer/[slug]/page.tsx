import { notFound } from "next/navigation";
import { DesignerGallery } from "@/components/designers/gallery";
import { DesignerHeader } from "@/components/designers/header";
import { DesignerModal } from "@/components/designers/modal";
import { getDesignerBySlug } from "@/lib/db/designers";
import { serializeDesigner } from "@/lib/designers/serialize";

// Rendered on a hard load / refresh / opening a shared link: the full grid plus
// the pop-up already open. Soft navigation from a card is handled by the
// intercepting route at @modal/(.)[slug].
export default async function DesignerSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) notFound();

  return (
    <>
      <DesignerHeader />
      <DesignerGallery />
      <DesignerModal designer={serializeDesigner(designer)} />
    </>
  );
}
