"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { createCurator, deleteCurator, reorderCurator, updateCurator, type CuratorInput } from "@/lib/db/curators";
import { updateSubmissionStatus } from "@/lib/db/submissions";

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
    coverImage: String(formData.get("coverImage") ?? "").trim() || null,
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

  // Created straight from a portfolio submission → mark that submission published.
  const fromSubmission = Number(formData.get("fromSubmission"));
  if (Number.isInteger(fromSubmission) && fromSubmission > 0) {
    await updateSubmissionStatus(fromSubmission, "published");
    revalidatePath("/admin/submissions");
  }

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

/** Persist a drag-and-drop move: `index` is the 0-based position in the full list. */
export async function setCuratorPositionAction(id: number, index: number): Promise<void> {
  await requireAdminSession();
  if (!Number.isInteger(index) || index < 0) return;
  await reorderCurator(id, index);
  revalidatePublicPages();
  revalidatePath("/admin");
}

/** Per-row shortcut: jump a portfolio to the very top or bottom of the whole list. */
export async function moveCuratorToEdgeAction(id: number, edge: "top" | "bottom"): Promise<void> {
  await requireAdminSession();
  await reorderCurator(id, edge === "top" ? 0 : Number.MAX_SAFE_INTEGER);
  revalidatePublicPages();
  revalidatePath("/admin");
}
