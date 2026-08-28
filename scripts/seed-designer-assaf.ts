import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

// Thirty-fourth example student — Диана Ассаф. Editable afterwards in the admin form.
const designer = {
  slug: "diana-assaf",
  first_name: "Диана",
  last_name: "Ассаф",
  cover_image: null as string | null,
  grade: "Junior", // not stated
  years_of_experience: null as number | null,
  open_to_work: false, // not stated
};

const links = [{ type: "telegram", url: "https://t.me/dianaassaf" }];

async function main() {
  const rows = await sql`
    INSERT INTO designers (slug, first_name, last_name, cover_image, grade, years_of_experience, open_to_work)
    VALUES (${designer.slug}, ${designer.first_name}, ${designer.last_name},
      ${designer.cover_image}, ${designer.grade}, ${designer.years_of_experience}, ${designer.open_to_work})
    ON CONFLICT (slug) DO UPDATE SET
      first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
      cover_image = EXCLUDED.cover_image, grade = EXCLUDED.grade,
      years_of_experience = EXCLUDED.years_of_experience, open_to_work = EXCLUDED.open_to_work,
      updated_at = now()
    RETURNING id
  `;
  const id = rows[0].id as number;

  await sql`DELETE FROM designer_taxonomy WHERE designer_id = ${id}`;
  await sql`DELETE FROM designer_links WHERE designer_id = ${id}`;
  await sql`DELETE FROM designer_programs WHERE designer_id = ${id}`;

  for (let i = 0; i < links.length; i++) {
    await sql`INSERT INTO designer_links (designer_id, type, url, sort_order) VALUES (${id}, ${links[i].type}, ${links[i].url}, ${i})`;
  }

  console.log(`Seeded designer #${id} — /designer/${designer.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
