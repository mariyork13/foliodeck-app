import { cache } from "react";
import type { Curator } from "@/lib/types";
import { sql } from "./client";
import type { TagType } from "./tags";

export type CuratorRecord = Curator & { id: number };

// Tag selections come in as ids (from the admin's tag-picker) rather than
// names: by submit time every selectable tag already exists in the `tags`
// table (the picker creates new ones inline before they become selectable),
// so linking is a plain id-based DELETE+INSERT, no name upsert needed here.
export type CuratorInput = {
  slug: string;
  name: string;
  role: string;
  externalUrl: string;
  previewImage: string;
  geo?: string | null;
  notes?: string | null;
  specializationIds: number[];
  companyIds: number[];
  collectionIds: number[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): CuratorRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    externalUrl: row.external_url,
    previewImage: row.preview_image,
    specializations: row.specializations ?? [],
    geo: row.geo ?? undefined,
    companies: row.companies ?? [],
    collections: row.collections ?? [],
    notes: row.notes ?? undefined,
  };
}

async function getCuratorsImpl(): Promise<CuratorRecord[]> {
  const rows = await sql`
    SELECT
      c.id, c.slug, c.name, c.role, c.external_url, c.preview_image, c.geo, c.notes, c.sort_order,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'specialization'), '{}') AS specializations,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'company'), '{}') AS companies,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'collection'), '{}') AS collections
    FROM curators c
    LEFT JOIN curator_tags ct ON ct.curator_id = c.id
    LEFT JOIN tags t ON t.id = ct.tag_id
    GROUP BY c.id
    ORDER BY c.sort_order, c.id
  `;
  return rows.map(mapRow);
}
// Wrapped in React's per-request cache so the layout and page fetching the
// same data in one render don't issue duplicate queries.
export const getCurators = cache(getCuratorsImpl);

async function getCuratorBySlugImpl(slug: string): Promise<CuratorRecord | null> {
  const rows = await sql`
    SELECT
      c.id, c.slug, c.name, c.role, c.external_url, c.preview_image, c.geo, c.notes, c.sort_order,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'specialization'), '{}') AS specializations,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'company'), '{}') AS companies,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'collection'), '{}') AS collections
    FROM curators c
    LEFT JOIN curator_tags ct ON ct.curator_id = c.id
    LEFT JOIN tags t ON t.id = ct.tag_id
    WHERE c.slug = ${slug}
    GROUP BY c.id
  `;
  return rows.length > 0 ? mapRow(rows[0]) : null;
}
export const getCuratorBySlug = cache(getCuratorBySlugImpl);

async function getCuratorByIdImpl(id: number): Promise<CuratorRecord | null> {
  const rows = await sql`
    SELECT
      c.id, c.slug, c.name, c.role, c.external_url, c.preview_image, c.geo, c.notes, c.sort_order,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'specialization'), '{}') AS specializations,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'company'), '{}') AS companies,
      COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'collection'), '{}') AS collections
    FROM curators c
    LEFT JOIN curator_tags ct ON ct.curator_id = c.id
    LEFT JOIN tags t ON t.id = ct.tag_id
    WHERE c.id = ${id}
    GROUP BY c.id
  `;
  return rows.length > 0 ? mapRow(rows[0]) : null;
}
export const getCuratorById = cache(getCuratorByIdImpl);

async function setCuratorTagIds(curatorId: number, type: TagType, tagIds: number[]): Promise<void> {
  await sql`
    DELETE FROM curator_tags
    WHERE curator_id = ${curatorId} AND tag_id IN (SELECT id FROM tags WHERE type = ${type})
  `;
  if (tagIds.length > 0) {
    await sql`
      INSERT INTO curator_tags (curator_id, tag_id)
      SELECT ${curatorId}, unnest(${tagIds}::int[])
      ON CONFLICT DO NOTHING
    `;
  }
}

async function linkTags(curatorId: number, input: CuratorInput): Promise<void> {
  await setCuratorTagIds(curatorId, "specialization", input.specializationIds);
  await setCuratorTagIds(curatorId, "company", input.companyIds);
  await setCuratorTagIds(curatorId, "collection", input.collectionIds);
}

export async function createCurator(input: CuratorInput): Promise<number> {
  const rows = await sql`
    INSERT INTO curators (slug, name, role, external_url, preview_image, geo, notes, sort_order)
    VALUES (
      ${input.slug}, ${input.name}, ${input.role}, ${input.externalUrl}, ${input.previewImage},
      ${input.geo ?? null}, ${input.notes ?? null},
      COALESCE((SELECT MIN(sort_order) FROM curators), 0) - 1
    )
    RETURNING id
  `;
  const id = rows[0].id as number;
  await linkTags(id, input);
  return id;
}

export async function updateCurator(id: number, input: CuratorInput): Promise<void> {
  await sql`
    UPDATE curators SET
      slug = ${input.slug},
      name = ${input.name},
      role = ${input.role},
      external_url = ${input.externalUrl},
      preview_image = ${input.previewImage},
      geo = ${input.geo ?? null},
      notes = ${input.notes ?? null},
      updated_at = now()
    WHERE id = ${id}
  `;
  await linkTags(id, input);
}

export async function deleteCurator(id: number): Promise<void> {
  await sql`DELETE FROM curators WHERE id = ${id}`;
}

export async function reorderCurator(id: number, newIndex: number): Promise<void> {
  const rows = await sql`SELECT id FROM curators ORDER BY sort_order, id`;
  const ids = rows.map((row) => row.id as number);
  const currentIndex = ids.indexOf(id);
  if (currentIndex === -1) return;

  ids.splice(currentIndex, 1);
  const clampedIndex = Math.max(0, Math.min(newIndex, ids.length));
  ids.splice(clampedIndex, 0, id);

  const positions = ids.map((_, index) => index);
  await sql`
    UPDATE curators AS c
    SET sort_order = v.ord
    FROM (SELECT unnest(${ids}::int[]) AS id, unnest(${positions}::int[]) AS ord) AS v
    WHERE c.id = v.id
  `;
}

export async function countCurators(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM curators`;
  return rows[0].count as number;
}

export async function getCuratorsPage(options: {
  query: string;
  page: number;
  pageSize: number;
}): Promise<{ items: CuratorRecord[]; total: number }> {
  const { query, page, pageSize } = options;
  const like = `%${query}%`;
  const offset = (page - 1) * pageSize;

  const [rows, countRows] = await Promise.all([
    sql`
      SELECT
        c.id, c.slug, c.name, c.role, c.external_url, c.preview_image, c.geo, c.notes, c.sort_order,
        COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'specialization'), '{}') AS specializations,
        COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'company'), '{}') AS companies,
        COALESCE(array_agg(t.name) FILTER (WHERE t.type = 'collection'), '{}') AS collections
      FROM curators c
      LEFT JOIN curator_tags ct ON ct.curator_id = c.id
      LEFT JOIN tags t ON t.id = ct.tag_id
      WHERE c.name ILIKE ${like} OR c.slug ILIKE ${like}
      GROUP BY c.id
      ORDER BY c.sort_order, c.id
      LIMIT ${pageSize} OFFSET ${offset}
    `,
    sql`SELECT COUNT(*)::int AS count FROM curators WHERE name ILIKE ${like} OR slug ILIKE ${like}`,
  ]);

  return { items: rows.map(mapRow), total: countRows[0].count as number };
}
