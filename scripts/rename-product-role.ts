import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// One-off: align the free-text portfolio caption (curators.role) with the
// renamed "Product & UX/UI" Design filter. Idempotent.

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`
    UPDATE curators
    SET role = replace(role, 'Product & UI UX', 'Product & UX/UI'), updated_at = now()
    WHERE role LIKE '%Product & UI UX%'
    RETURNING id
  `;
  console.log(`Updated ${rows.length} portfolio caption(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
