"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import * as tagsDb from "@/lib/db/tags";

export type { TagType, Tag } from "@/lib/db/tags";

// Tag names and company logos surface both in the tag lists and inside every
// curator's data, so bust both data-cache tags.
function revalidateTagCaches(): void {
  revalidateTag("tags", { expire: 0 });
  revalidateTag("curators", { expire: 0 });
  revalidatePath("/", "layout");
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
