import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// One-off: relabel a few public "Design" (specialization) tags. Curator links
// are by tag id, so renaming the row updates the filters and every profile.
// Idempotent: a tag already at the new name is skipped.

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

const RENAMES: [from: string, to: string][] = [
  ["Art", "Art & Illustration"],
  ["Brand", "Branding"],
  ["Product & UI UX", "Product & UX/UI"],
];

async function main() {
  for (const [from, to] of RENAMES) {
    const rows = await sql`
      UPDATE tags SET name = ${to}
      WHERE type = 'specialization' AND name = ${from}
      RETURNING id
    `;
    console.log(rows.length ? `"${from}" → "${to}"` : `"${from}" not found (already renamed?)`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
