import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { TAXONOMY_SEED } from "../src/lib/designers/taxonomy-seed";
import { slugify } from "../src/lib/designers/slug";

// Minimal .env.local loader (no dotenv dependency) — same as setup-schema.ts.
const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS designers (
      id                  SERIAL PRIMARY KEY,
      slug                TEXT NOT NULL UNIQUE,
      first_name          TEXT NOT NULL,
      last_name           TEXT NOT NULL,
      cover_image         TEXT,
      grade               TEXT NOT NULL,
      years_of_experience INTEGER,
      open_to_work        BOOLEAN NOT NULL DEFAULT false,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE designers ADD COLUMN IF NOT EXISTS open_to_work BOOLEAN NOT NULL DEFAULT false`;
  await sql`CREATE INDEX IF NOT EXISTS designers_name_idx ON designers (last_name, first_name)`;
  await sql`CREATE INDEX IF NOT EXISTS designers_created_at_idx ON designers (created_at DESC, id DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS taxonomy (
      id         SERIAL PRIMARY KEY,
      category   TEXT NOT NULL CHECK (category IN
                   ('platform','business_model','industry','interface_type','skill','company_type')),
      name       TEXT NOT NULL,
      slug       TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE (category, slug)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS taxonomy_category_idx ON taxonomy (category)`;

  await sql`
    CREATE TABLE IF NOT EXISTS designer_taxonomy (
      designer_id INTEGER NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
      taxonomy_id INTEGER NOT NULL REFERENCES taxonomy(id) ON DELETE CASCADE,
      PRIMARY KEY (designer_id, taxonomy_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS designer_taxonomy_taxonomy_id_idx ON designer_taxonomy (taxonomy_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS designer_images (
      id          SERIAL PRIMARY KEY,
      designer_id INTEGER NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
      url         TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS designer_images_designer_id_idx ON designer_images (designer_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS designer_programs (
      id          SERIAL PRIMARY KEY,
      designer_id INTEGER NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
      program     TEXT NOT NULL,
      cohort      TEXT NOT NULL,
      year        INTEGER NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS designer_programs_designer_id_idx ON designer_programs (designer_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS designer_links (
      id          SERIAL PRIMARY KEY,
      designer_id INTEGER NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
      type        TEXT NOT NULL,
      url         TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS designer_links_designer_id_idx ON designer_links (designer_id)`;

  // Seed the base vocabulary. Idempotent: existing terms are left untouched.
  let seeded = 0;
  for (const [category, names] of Object.entries(TAXONOMY_SEED)) {
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const slug = slugify(name) || name.toLowerCase();
      const rows = await sql`
        INSERT INTO taxonomy (category, name, slug, sort_order)
        VALUES (${category}, ${name}, ${slug}, ${i})
        ON CONFLICT (category, slug) DO NOTHING
        RETURNING id
      `;
      seeded += rows.length;
    }
  }

  console.log(`Designer schema ready. Seeded ${seeded} new taxonomy terms.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
