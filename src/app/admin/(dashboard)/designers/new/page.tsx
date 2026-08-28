import Link from "next/link";
import { DesignerForm } from "@/components/designers/designer-form";
import { createDesignerAction } from "@/lib/actions/designers";
import { getTaxonomyGrouped } from "@/lib/db/taxonomy";

export const dynamic = "force-dynamic";

export default async function NewDesignerPage() {
  const taxonomy = await getTaxonomyGrouped();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-medium">Новый ученик</h1>
        <Link href="/designer" className="text-sm text-white/60 hover:text-white">
          ← К базе
        </Link>
      </div>
      <DesignerForm action={createDesignerAction} taxonomy={taxonomy} />
    </div>
  );
}
