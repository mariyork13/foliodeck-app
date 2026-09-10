"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import * as tagsDb from "@/lib/db/tags";

export type { TagType, Tag } from "@/lib/db/tags";

function revalidateTagCaches(): void {
  revalidatePath("/", "layout"); // filter options + company logos in the header
  revalidatePath("/curator/[slug]", "page"); // tag names shown on curator pages
  revalidatePath("/admin/tags");
}

export async function createTag(type: tagsDb.TagType, name: string): Promise<tagsDb.Tag> {
  await requireAdminSession();
  const trimmed = name.trim();
  const tag = await tagsDb.createTag(type, trimmed);
  revalidateTagCaches();
  return tag;
}

export async function renameTagAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await tagsDb.renameTag(id, name);
  revalidateTagCaches();
}

export async function deleteTagAction(id: number): Promise<void> {
  await requireAdminSession();
  await tagsDb.deleteTag(id);
  revalidateTagCaches();
}

export async function setTagLogoAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const logo = String(formData.get("logo") ?? "").trim();
  await tagsDb.setTagLogo(id, logo || null);
  revalidateTagCaches();
}
