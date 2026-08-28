import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

// Twenty-second example student — Илнур Галимов. Editable afterwards in the admin form.
const designer = {
  slug: "ilnur-galimov",
  first_name: "Илнур",
  last_name: "Галимов",
  cover_image: null as string | null, // TODO: add a cover image URL in the editor
  grade: "Junior", // not stated; "Карьера" program graduate
  years_of_experience: null as number | null,
  open_to_work: false, // not stated in the source
};

const taxonomy: Record<string, string[]> = {
  platform: ["Web", "Mobile"],
  business_model: [],
  industry: [],
  interface_type: [],
  skill: [],
  company_type: [],
};

const programs = [{ program: "Карьера", cohort: "4", year: 2026 }];

const links = [
  { type: "portfolio", url: "https://galimovilnur-portfolio.ru/" },
  { type: "telegram", url: "https://t.me/IlnurG757" },
];

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

  const missing: string[] = [];
  for (const [category, names] of Object.entries(taxonomy)) {
    for (const name of names) {
      const term = await sql`SELECT id FROM taxonomy WHERE category = ${category} AND name = ${name}`;
      if (term.length === 0) {
        missing.push(`${category}/${name}`);
        continue;
      }
      await sql`INSERT INTO designer_taxonomy (designer_id, taxonomy_id) VALUES (${id}, ${term[0].id}) ON CONFLICT DO NOTHING`;
    }
  }

  for (let i = 0; i < programs.length; i++) {
    const p = programs[i];
    await sql`
      INSERT INTO designer_programs (designer_id, program, cohort, year, sort_order)
      VALUES (${id}, ${p.program}, ${p.cohort}, ${p.year}, ${i})
    `;
  }

  for (let i = 0; i < links.length; i++) {
    await sql`INSERT INTO designer_links (designer_id, type, url, sort_order) VALUES (${id}, ${links[i].type}, ${links[i].url}, ${i})`;
  }

  console.log(`Seeded designer #${id} — /designer/${designer.slug}`);
  if (missing.length) console.log("Missing taxonomy terms (skipped):", missing.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
