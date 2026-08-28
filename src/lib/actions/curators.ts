"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { createCurator, deleteCurator, reorderCurator, updateCurator, type CuratorInput } from "@/lib/db/curators";

function parseIds(formData: FormData, field: string): number[] {
  return formData
    .getAll(field)
    .map((value) => Number(value))
    .filter((n) => Number.isInteger(n));
}

function parseInput(formData: FormData): CuratorInput {
  const geo = formData.get("geo");
  const notes = formData.get("notes");
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    externalUrl: String(formData.get("externalUrl") ?? "").trim(),
    previewImage: String(formData.get("previewImage") ?? "").trim(),
    geo: typeof geo === "string" && geo.trim() ? geo.trim() : null,
    notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    specializationIds: parseIds(formData, "specializationIds"),
    companyIds: parseIds(formData, "companyIds"),
    collectionIds: parseIds(formData, "collectionIds"),
  };
}

function revalidatePublicPages(slug?: string): void {
  revalidatePath("/");
  if (slug) revalidatePath("/curator/[slug]", "page");
}

export async function createCuratorAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const input = parseInput(formData);
  await createCurator(input);
  revalidatePublicPages(input.slug);
  redirect("/admin");
}

export async function updateCuratorAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const input = parseInput(formData);
  await updateCurator(id, input);
  revalidatePublicPages(input.slug);
  redirect("/admin");
}

export async function deleteCuratorAction(id: number): Promise<void> {
  await requireAdminSession();
  await deleteCurator(id);
  revalidatePublicPages();
  revalidatePath("/admin");
}

export async function reorderCuratorAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const position = Number(formData.get("position"));
  if (!Number.isInteger(position) || position < 1) return;
  await reorderCurator(id, position - 1);
  revalidatePublicPages();
  revalidatePath("/admin");
}
