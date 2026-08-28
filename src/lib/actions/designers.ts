"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  createDesigner,
  deleteDesigner,
  getDesignerById,
  updateDesigner,
} from "@/lib/db/designers";
import { isBlobUrl } from "@/lib/designers/blob";
import { designerSlug } from "@/lib/designers/slug";
import type { Designer, DesignerInput } from "@/lib/designers/types";

function imageUrls(source: Pick<Designer, "coverImage" | "images"> | DesignerInput): string[] {
  return [source.coverImage, ...source.images].filter(
    (url): url is string => typeof url === "string" && url.trim() !== "",
  );
}

/** Best-effort removal of blobs we own; never blocks the main mutation. */
async function deleteBlobs(urls: string[]): Promise<void> {
  const owned = urls.filter(isBlobUrl);
  if (owned.length === 0) return;
  try {
    await del(owned, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {
    // orphaned blobs are harmless; ignore
  }
}

function parseDesignerInput(fd: FormData): DesignerInput {
  const firstName = String(fd.get("firstName") ?? "").trim();
  const lastName = String(fd.get("lastName") ?? "").trim();
  const slugRaw = String(fd.get("slug") ?? "").trim();
  const slug = slugRaw || designerSlug(firstName, lastName);

  const coverImage = String(fd.get("coverImage") ?? "").trim() || null;
  const grade = String(fd.get("grade") ?? "").trim();

  const yoeRaw = String(fd.get("yearsOfExperience") ?? "").trim();
  const yoe = yoeRaw === "" ? null : Number(yoeRaw);
  const yearsOfExperience = yoe != null && Number.isFinite(yoe) ? Math.trunc(yoe) : null;

  const openToWork = fd.get("openToWork") != null;

  const images = fd
    .getAll("images")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const taxonomyIds = fd
    .getAll("taxonomyIds")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n));

  const programPrograms = fd.getAll("programProgram").map(String);
  const programCohorts = fd.getAll("programCohort").map(String);
  const programYears = fd.getAll("programYear").map(String);
  const programs = programPrograms
    .map((program, i) => ({
      program: program.trim(),
      cohort: (programCohorts[i] ?? "").trim(),
      year: Number((programYears[i] ?? "").trim()),
    }))
    .filter((p) => p.program && Number.isInteger(p.year));

  const linkTypes = fd.getAll("linkType").map(String);
  const linkUrls = fd.getAll("linkUrl").map(String);
  const links = linkTypes
    .map((type, i) => ({ type: type.trim(), url: (linkUrls[i] ?? "").trim() }))
    .filter((l) => l.type && l.url);

  return {
    slug,
    firstName,
    lastName,
    coverImage,
    images,
    grade,
    yearsOfExperience,
    openToWork,
    taxonomyIds,
    programs,
    links,
  };
}

export async function createDesignerAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const input = parseDesignerInput(formData);
  await createDesigner(input);
  revalidatePath("/designer", "layout");
  redirect(`/designer/${input.slug}`);
}

export async function updateDesignerAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const input = parseDesignerInput(formData);

  const previous = await getDesignerById(id);
  await updateDesigner(id, input);

  if (previous) {
    const kept = new Set(imageUrls(input));
    await deleteBlobs(imageUrls(previous).filter((url) => !kept.has(url)));
  }

  revalidatePath("/designer", "layout");
  redirect(`/designer/${input.slug}`);
}

export async function deleteDesignerAction(id: number): Promise<void> {
  await requireAdminSession();
  const designer = await getDesignerById(id);
  await deleteDesigner(id);
  if (designer) await deleteBlobs(imageUrls(designer));
  revalidatePath("/designer", "layout");
  redirect("/designer");
}
