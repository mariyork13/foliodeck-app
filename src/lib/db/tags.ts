import { cache } from "react";
import { sql } from "./client";

export type TagType = "specialization" | "company" | "collection";

export type Tag = { id: number; type: TagType; name: string };
export type TagWithUsage = Tag & { usageCount: number };

async function getTagsByTypeImpl(type: TagType): Promise<Tag[]> {
  const rows = await sql`SELECT id, type, name FROM tags WHERE type = ${type} ORDER BY name`;
  return rows as Tag[];
}
export const getTagsByType = cache(getTagsByTypeImpl);

async function getAllTagsGroupedImpl(): Promise<Record<TagType, Tag[]>> {
  const rows = await sql`SELECT id, type, name FROM tags ORDER BY type, name`;
  const grouped: Record<TagType, Tag[]> = { specialization: [], company: [], collection: [] };
  for (const row of rows as Tag[]) grouped[row.type].push(row);
  return grouped;
}
export const getAllTagsGrouped = cache(getAllTagsGroupedImpl);

async function getAllTagsGroupedWithUsageImpl(): Promise<Record<TagType, TagWithUsage[]>> {
  const rows = await sql`
    SELECT t.id, t.type, t.name, COUNT(ct.curator_id)::int AS "usageCount"
    FROM tags t
    LEFT JOIN curator_tags ct ON ct.tag_id = t.id
    GROUP BY t.id
    ORDER BY t.type, t.name
  `;
  const grouped: Record<TagType, TagWithUsage[]> = { specialization: [], company: [], collection: [] };
  for (const row of rows as TagWithUsage[]) grouped[row.type].push(row);
  return grouped;
}
export const getAllTagsGroupedWithUsage = cache(getAllTagsGroupedWithUsageImpl);

async function getDistinctGeoValuesImpl(): Promise<string[]> {
  const rows = await sql`SELECT DISTINCT geo FROM curators WHERE geo IS NOT NULL ORDER BY geo`;
  return rows.map((row) => row.geo as string);
}
export const getDistinctGeoValues = cache(getDistinctGeoValuesImpl);

export async function createTag(type: TagType, name: string): Promise<Tag> {
  const rows = await sql`
    INSERT INTO tags (type, name) VALUES (${type}, ${name})
    ON CONFLICT (type, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, type, name
  `;
  return rows[0] as Tag;
}

export async function renameTag(id: number, name: string): Promise<void> {
  await sql`UPDATE tags SET name = ${name} WHERE id = ${id}`;
}

export async function deleteTag(id: number): Promise<void> {
  await sql`DELETE FROM tags WHERE id = ${id}`;
}

