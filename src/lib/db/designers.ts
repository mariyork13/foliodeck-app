import { cache } from "react";
import { type TaxonomyCategory } from "@/lib/designers/constants";
import { emptyTaxonomy, type Designer, type DesignerInput } from "@/lib/designers/types";
import { sql } from "./client";

type BaseRow = {
  id: number;
  slug: string;
  first_name: string;
  last_name: string;
  cover_image: string | null;
  grade: string;
  years_of_experience: number | null;
  open_to_work: boolean;
};

function baseToDesigner(row: BaseRow): Designer {
  return {
    id: row.id,
    slug: row.slug,
    firstName: row.first_name,
    lastName: row.last_name,
    coverImage: row.cover_image,
    images: [],
    grade: row.grade,
    yearsOfExperience: row.years_of_experience,
    openToWork: row.open_to_work,
    taxonomy: emptyTaxonomy(),
    programs: [],
    links: [],
  };
}

// Child rows are fetched in separate queries and stitched in JS rather than a
// single multi-join (which would multiply rows across taxonomy × images ×
// programs × links). Cost is a fixed 5 round-trips regardless of row count.
async function assembleDesigners(baseRows: BaseRow[]): Promise<Designer[]> {
  const designers = baseRows.map(baseToDesigner);
  const byId = new Map(designers.map((d) => [d.id, d]));
  const ids = designers.map((d) => d.id);
  if (ids.length === 0) return designers;

  const [taxRows, imgRows, progRows, linkRows] = await Promise.all([
    sql`
      SELECT dt.designer_id, t.category, t.name
      FROM designer_taxonomy dt
      JOIN taxonomy t ON t.id = dt.taxonomy_id
      WHERE dt.designer_id = ANY(${ids}::int[])
      ORDER BY t.sort_order, t.name
    `,
    sql`SELECT designer_id, url FROM designer_images WHERE designer_id = ANY(${ids}::int[]) ORDER BY sort_order, id`,
    sql`SELECT designer_id, program, cohort, year FROM designer_programs WHERE designer_id = ANY(${ids}::int[]) ORDER BY sort_order, id`,
    sql`SELECT designer_id, type, url FROM designer_links WHERE designer_id = ANY(${ids}::int[]) ORDER BY sort_order, id`,
  ]);

  for (const r of taxRows as { designer_id: number; category: TaxonomyCategory; name: string }[]) {
    byId.get(r.designer_id)?.taxonomy[r.category].push(r.name);
  }
  for (const r of imgRows as { designer_id: number; url: string }[]) {
    byId.get(r.designer_id)?.images.push(r.url);
  }
  for (const r of progRows as {
    designer_id: number;
    program: string;
    cohort: string;
    year: number;
  }[]) {
    byId.get(r.designer_id)?.programs.push({ program: r.program, cohort: r.cohort, year: r.year });
  }
  for (const r of linkRows as { designer_id: number; type: string; url: string }[]) {
    byId.get(r.designer_id)?.links.push({ type: r.type, url: r.url });
  }

  return designers;
}

async function getDesignersImpl(): Promise<Designer[]> {
  // Newest first — a freshly added designer shows at the top of the grid.
  const rows = await sql`
    SELECT id, slug, first_name, last_name, cover_image, grade, years_of_experience, open_to_work
    FROM designers
    ORDER BY created_at DESC, id DESC
  `;
  return assembleDesigners(rows as BaseRow[]);
}
export const getDesigners = cache(getDesignersImpl);

async function getDesignerBySlugImpl(slug: string): Promise<Designer | null> {
  const rows = await sql`
    SELECT id, slug, first_name, last_name, cover_image, grade, years_of_experience, open_to_work
    FROM designers WHERE slug = ${slug}
  `;
  if (rows.length === 0) return null;
  return (await assembleDesigners(rows as BaseRow[]))[0];
}
export const getDesignerBySlug = cache(getDesignerBySlugImpl);

async function getDesignerByIdImpl(id: number): Promise<Designer | null> {
  const rows = await sql`
    SELECT id, slug, first_name, last_name, cover_image, grade, years_of_experience, open_to_work
    FROM designers WHERE id = ${id}
  `;
  if (rows.length === 0) return null;
  return (await assembleDesigners(rows as BaseRow[]))[0];
}
export const getDesignerById = cache(getDesignerByIdImpl);

async function getDistinctProgramYearsImpl(): Promise<number[]> {
  const rows = await sql`SELECT DISTINCT year FROM designer_programs ORDER BY year DESC`;
  return rows.map((row) => row.year as number);
}
export const getDistinctProgramYears = cache(getDistinctProgramYearsImpl);

async function replaceChildren(designerId: number, input: DesignerInput): Promise<void> {
  await Promise.all([
    sql`DELETE FROM designer_taxonomy WHERE designer_id = ${designerId}`,
    sql`DELETE FROM designer_images WHERE designer_id = ${designerId}`,
    sql`DELETE FROM designer_programs WHERE designer_id = ${designerId}`,
    sql`DELETE FROM designer_links WHERE designer_id = ${designerId}`,
  ]);

  const taxIds = input.taxonomyIds.filter((n) => Number.isInteger(n));
  if (taxIds.length > 0) {
    await sql`
      INSERT INTO designer_taxonomy (designer_id, taxonomy_id)
      SELECT ${designerId}, unnest(${taxIds}::int[])
      ON CONFLICT DO NOTHING
    `;
  }

  const images = input.images.map((u) => u.trim()).filter(Boolean);
  for (let i = 0; i < images.length; i++) {
    await sql`INSERT INTO designer_images (designer_id, url, sort_order) VALUES (${designerId}, ${images[i]}, ${i})`;
  }

  const programs = input.programs.filter((p) => p.program.trim() && Number.isInteger(p.year));
  for (let i = 0; i < programs.length; i++) {
    const p = programs[i];
    await sql`
      INSERT INTO designer_programs (designer_id, program, cohort, year, sort_order)
      VALUES (${designerId}, ${p.program.trim()}, ${String(p.cohort).trim()}, ${p.year}, ${i})
    `;
  }

  const links = input.links.filter((l) => l.type.trim() && l.url.trim());
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    await sql`
      INSERT INTO designer_links (designer_id, type, url, sort_order)
      VALUES (${designerId}, ${l.type.trim()}, ${l.url.trim()}, ${i})
    `;
  }
}

export async function createDesigner(input: DesignerInput): Promise<number> {
  const rows = await sql`
    INSERT INTO designers (slug, first_name, last_name, cover_image, grade, years_of_experience, open_to_work)
    VALUES (
      ${input.slug}, ${input.firstName}, ${input.lastName},
      ${input.coverImage}, ${input.grade}, ${input.yearsOfExperience}, ${input.openToWork}
    )
    RETURNING id
  `;
  const id = rows[0].id as number;
  await replaceChildren(id, input);
  return id;
}

export async function updateDesigner(id: number, input: DesignerInput): Promise<void> {
  await sql`
    UPDATE designers SET
      slug = ${input.slug},
      first_name = ${input.firstName},
      last_name = ${input.lastName},
      cover_image = ${input.coverImage},
      grade = ${input.grade},
      years_of_experience = ${input.yearsOfExperience},
      open_to_work = ${input.openToWork},
      updated_at = now()
    WHERE id = ${id}
  `;
  await replaceChildren(id, input);
}

export async function deleteDesigner(id: number): Promise<void> {
  await sql`DELETE FROM designers WHERE id = ${id}`;
}
