import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Manual cover image that replaces a broken site preview on the gallery card.
// preview_image stays as the auto site screenshot (often a dead Tilda link).

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`ALTER TABLE curators ADD COLUMN IF NOT EXISTS cover_image TEXT`;
  console.log("curators.cover_image ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
