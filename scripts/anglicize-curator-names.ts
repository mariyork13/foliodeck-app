import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// One-off: the public site is English, but ~38 portfolio entries still had
// Cyrillic `name` values. Each already has a Latin `slug` (hand-made when the
// row was created), so the English name is the title-cased slug.
// Idempotent: only rows whose name still contains Cyrillic are touched.

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

const titleCaseSlug = (slug: string): string =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

async function main() {
  const rows = (await sql`
    SELECT id, name, slug FROM curators WHERE name ~ '[А-Яа-я]' ORDER BY id
  `) as { id: number; name: string; slug: string }[];

  if (rows.length === 0) {
    console.log("No Cyrillic portfolio names left. Nothing to do.");
    return;
  }

  for (const row of rows) {
    const next = titleCaseSlug(row.slug);
    await sql`UPDATE curators SET name = ${next}, updated_at = now() WHERE id = ${row.id}`;
    console.log(`#${row.id}  ${row.name}  ->  ${next}`);
  }

  console.log(`\nUpdated ${rows.length} portfolio name(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
