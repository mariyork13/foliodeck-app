import { notFound } from "next/navigation";
import { DesignerModal } from "@/components/designers/modal";
import { getDesignerBySlug } from "@/lib/db/designers";
import { serializeDesigner } from "@/lib/designers/serialize";

// Intercepts a soft navigation to /designer/[slug] (a card click) and renders
// the pop-up over the grid without leaving the page.
export default async function InterceptedDesignerModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) notFound();

  return <DesignerModal designer={serializeDesigner(designer)} intercepted />;
}
