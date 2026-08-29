import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Screenshots shown on the public portfolio page (/curator/[slug]), replacing
// the live <iframe> that Tilda and others block. Card preview stays on
// curators.preview_image. Mirrors designer_images.

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS curator_images (
      id          SERIAL PRIMARY KEY,
      curator_id  INTEGER NOT NULL REFERENCES curators(id) ON DELETE CASCADE,
      url         TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS curator_images_curator_id_idx ON curator_images (curator_id)`;

  console.log("curator_images schema ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
