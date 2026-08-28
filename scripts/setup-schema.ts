import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Minimal .env.local loader (no dotenv dependency).
const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS curators (
      id            SERIAL PRIMARY KEY,
      slug          TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL,
      role          TEXT NOT NULL,
      external_url  TEXT NOT NULL,
      preview_image TEXT NOT NULL,
      geo           TEXT,
      notes         TEXT,
      sort_order    INTEGER NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS curators_sort_order_idx ON curators (sort_order, id)`;
  await sql`CREATE INDEX IF NOT EXISTS curators_geo_idx ON curators (geo)`;

  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id    SERIAL PRIMARY KEY,
      type  TEXT NOT NULL CHECK (type IN ('specialization', 'company', 'collection')),
      name  TEXT NOT NULL,
      UNIQUE (type, name)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS curator_tags (
      curator_id INTEGER NOT NULL REFERENCES curators(id) ON DELETE CASCADE,
      tag_id     INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (curator_id, tag_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS curator_tags_tag_id_idx ON curator_tags (tag_id)`;

  console.log("Schema created successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
