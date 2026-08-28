import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignerForm } from "@/components/designers/designer-form";
import { updateDesignerAction } from "@/lib/actions/designers";
import { getDesignerById } from "@/lib/db/designers";
import { getTaxonomyGrouped } from "@/lib/db/taxonomy";

export const dynamic = "force-dynamic";

export default async function EditDesignerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const designerId = Number(id);
  if (!Number.isInteger(designerId)) notFound();

  const [designer, taxonomy] = await Promise.all([
    getDesignerById(designerId),
    getTaxonomyGrouped(),
  ]);
  if (!designer) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-medium">
          {designer.firstName} {designer.lastName}
        </h1>
        <Link href={`/designer/${designer.slug}`} className="text-sm text-white/60 hover:text-white">
          ← К профилю
        </Link>
      </div>
      <DesignerForm
        action={updateDesignerAction.bind(null, designerId)}
        designer={designer}
        taxonomy={taxonomy}
      />
    </div>
  );
}
