"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import type { TaxonomyCategory } from "@/lib/designers/constants";
import * as taxonomyDb from "@/lib/db/taxonomy";

export type { TaxonomyTerm } from "@/lib/db/taxonomy";

export async function createTaxonomyTermAction(
  category: TaxonomyCategory,
  name: string,
): Promise<taxonomyDb.TaxonomyTerm> {
  await requireAdminSession();
  const trimmed = name.trim();
  const term = await taxonomyDb.createTaxonomyTerm(category, trimmed);
  revalidatePath("/designer", "layout");
  return term;
}

export async function renameTaxonomyTermAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await taxonomyDb.renameTaxonomyTerm(id, name);
  revalidatePath("/designer", "layout");
}

export async function deleteTaxonomyTermAction(id: number): Promise<void> {
  await requireAdminSession();
  await taxonomyDb.deleteTaxonomyTerm(id);
  revalidatePath("/designer", "layout");
}
