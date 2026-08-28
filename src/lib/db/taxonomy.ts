import { cache } from "react";
import { type TaxonomyCategory } from "@/lib/designers/constants";
import { slugify } from "@/lib/designers/slug";
import { sql } from "./client";

export type TaxonomyTerm = {
  id: number;
  category: TaxonomyCategory;
  name: string;
  slug: string;
  sortOrder: number;
};

export type TaxonomyTermWithUsage = TaxonomyTerm & { usageCount: number };

export type TaxonomyGrouped<T = TaxonomyTerm> = Record<TaxonomyCategory, T[]>;

function emptyGrouped<T>(): TaxonomyGrouped<T> {
  return {
    platform: [],
    business_model: [],
    industry: [],
    interface_type: [],
    skill: [],
    company_type: [],
  };
}

async function getTaxonomyGroupedImpl(): Promise<TaxonomyGrouped> {
  const rows = await sql`
    SELECT id, category, name, slug, sort_order AS "sortOrder"
    FROM taxonomy
    ORDER BY category, sort_order, name
  `;
  const grouped = emptyGrouped<TaxonomyTerm>();
  for (const row of rows as TaxonomyTerm[]) grouped[row.category].push(row);
  return grouped;
}
export const getTaxonomyGrouped = cache(getTaxonomyGroupedImpl);

async function getTaxonomyGroupedWithUsageImpl(): Promise<TaxonomyGrouped<TaxonomyTermWithUsage>> {
  const rows = await sql`
    SELECT t.id, t.category, t.name, t.slug, t.sort_order AS "sortOrder",
      COUNT(dt.designer_id)::int AS "usageCount"
    FROM taxonomy t
    LEFT JOIN designer_taxonomy dt ON dt.taxonomy_id = t.id
    GROUP BY t.id
    ORDER BY t.category, t.sort_order, t.name
  `;
  const grouped = emptyGrouped<TaxonomyTermWithUsage>();
  for (const row of rows as TaxonomyTermWithUsage[]) grouped[row.category].push(row);
  return grouped;
}
export const getTaxonomyGroupedWithUsage = cache(getTaxonomyGroupedWithUsageImpl);

export async function createTaxonomyTerm(
  category: TaxonomyCategory,
  name: string,
): Promise<TaxonomyTerm> {
  const trimmed = name.trim();
  const slug = slugify(trimmed) || trimmed.toLowerCase();
  const rows = await sql`
    INSERT INTO taxonomy (category, name, slug, sort_order)
    VALUES (
      ${category}, ${trimmed}, ${slug},
      COALESCE((SELECT MAX(sort_order) FROM taxonomy WHERE category = ${category}), 0) + 1
    )
    ON CONFLICT (category, slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, category, name, slug, sort_order AS "sortOrder"
  `;
  return rows[0] as TaxonomyTerm;
}

export async function renameTaxonomyTerm(id: number, name: string): Promise<void> {
  const trimmed = name.trim();
  // Keep slug in sync so a later taxonomy-seed re-run recognises the term
  // instead of inserting a same-named duplicate.
  const slug = slugify(trimmed) || trimmed.toLowerCase();
  await sql`UPDATE taxonomy SET name = ${trimmed}, slug = ${slug} WHERE id = ${id}`;
}

export async function deleteTaxonomyTerm(id: number): Promise<void> {
  await sql`DELETE FROM taxonomy WHERE id = ${id}`;
}
