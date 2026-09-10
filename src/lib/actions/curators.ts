"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createCurator, deleteCurator, reorderCurator, updateCurator, type CuratorInput } from "@/lib/db/curators";
import { updateSubmissionStatus } from "@/lib/db/submissions";
import { slugify } from "@/lib/designers/slug";

function parseIds(formData: FormData, field: string): number[] {
  return formData
    .getAll(field)
    .map((value) => Number(value))
    .filter((n) => Number.isInteger(n));
}

function parseInput(formData: FormData): CuratorInput {
  const geo = formData.get("geo");
  const notes = formData.get("notes");
  const name = String(formData.get("name") ?? "").trim();
  // The form no longer shows a slug field: keep the existing one when editing,
  // derive it from the name otherwise. Anything that isn't already slug-shaped
  // (e.g. an old card where a full URL got typed into the removed field) is
  // regenerated from the name — self-healing on the next save.
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug) ? rawSlug : slugify(name);
  return {
    slug,
    name,
    role: String(formData.get("role") ?? "").trim(),
    externalUrl: String(formData.get("externalUrl") ?? "").trim(),
    previewImage: String(formData.get("previewImage") ?? "").trim(),
    coverImage: String(formData.get("coverImage") ?? "").trim() || null,
    // Checkbox: ticked = the site refuses to be framed → show the cover instead.
    embeddable: formData.get("notEmbeddable") === "on" ? false : true,
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
  // No redirect: the form lives in a modal now and closes itself client-side.
  revalidatePath("/admin");
}

export async function updateCuratorAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const input = parseInput(formData);
  await updateCurator(id, input);
  revalidatePublicPages(input.slug);
  // No redirect: the edit form lives in a modal now and closes itself client-side
  // (router.back / router.refresh) so the list keeps its scroll position.
  revalidatePath("/admin");
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
