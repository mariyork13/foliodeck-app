"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import * as tagsDb from "@/lib/db/tags";

export type { TagType, Tag } from "@/lib/db/tags";

export async function createTag(type: tagsDb.TagType, name: string): Promise<tagsDb.Tag> {
  await requireAdminSession();
  const trimmed = name.trim();
  const tag = await tagsDb.createTag(type, trimmed);
  revalidatePath("/", "layout");
  revalidatePath("/admin/tags");
  return tag;
}

export async function renameTagAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await tagsDb.renameTag(id, name);
  revalidatePath("/", "layout");
  revalidatePath("/admin/tags");
}

export async function deleteTagAction(id: number): Promise<void> {
  await requireAdminSession();
  await tagsDb.deleteTag(id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/tags");
}
