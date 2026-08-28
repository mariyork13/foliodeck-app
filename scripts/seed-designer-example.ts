import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Minimal .env.local loader (same as setup-schema.ts).
const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

// First example student — mapped from the profile the admin provided.
// Everything here is editable afterwards via /admin/designers/[id]/edit.
const designer = {
  slug: "maria-kudryavtseva",
  first_name: "Мария",
  last_name: "Кудрявцева",
  cover_image: null as string | null, // TODO: paste a cover image URL in the editor
  grade: "Senior",
  years_of_experience: 6,
};

const taxonomy: Record<string, string[]> = {
  platform: ["Mobile", "iOS", "Android", "Web"],
  business_model: ["B2C", "B2B"],
  industry: ["Fintech", "PropTech"],
  interface_type: [],
  skill: ["UI / Visual design", "Mobile design", "Web design", "Research"],
  company_type: ["BigTech", "Startup"],
};

const images: string[] = [];

const programs: { program: string; cohort: string; year: number }[] = [];

const links = [
  { type: "portfolio", url: "https://mariakudrow.yonote.ru/share/me" },
  { type: "portfolio", url: "https://dprofile.ru/mariakudrow" },
  { type: "cv", url: "https://spb.hh.ru/resume/a5ddc78bff0edfd8950039ed1f59397758676e" },
  { type: "linkedin", url: "https://www.linkedin.com/in/mariakudrow" },
  { type: "telegram", url: "https://t.me/mariakudrow" },
];

async function main() {
  const rows = await sql`
    INSERT INTO designers (slug, first_name, last_name, cover_image, grade, years_of_experience)
    VALUES (
      ${designer.slug}, ${designer.first_name}, ${designer.last_name},
      ${designer.cover_image}, ${designer.grade}, ${designer.years_of_experience}
    )
    ON CONFLICT (slug) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      cover_image = EXCLUDED.cover_image,
      grade = EXCLUDED.grade,
      years_of_experience = EXCLUDED.years_of_experience,
      updated_at = now()
    RETURNING id
  `;
  const id = rows[0].id as number;

  await sql`DELETE FROM designer_taxonomy WHERE designer_id = ${id}`;
  await sql`DELETE FROM designer_images WHERE designer_id = ${id}`;
  await sql`DELETE FROM designer_programs WHERE designer_id = ${id}`;
  await sql`DELETE FROM designer_links WHERE designer_id = ${id}`;

  const missing: string[] = [];
  for (const [category, names] of Object.entries(taxonomy)) {
    for (const name of names) {
      const term = await sql`SELECT id FROM taxonomy WHERE category = ${category} AND name = ${name}`;
      if (term.length === 0) {
        missing.push(`${category}/${name}`);
        continue;
      }
      await sql`
        INSERT INTO designer_taxonomy (designer_id, taxonomy_id)
        VALUES (${id}, ${term[0].id}) ON CONFLICT DO NOTHING
      `;
    }
  }

  for (let i = 0; i < images.length; i++) {
    await sql`INSERT INTO designer_images (designer_id, url, sort_order) VALUES (${id}, ${images[i]}, ${i})`;
  }
  for (let i = 0; i < programs.length; i++) {
    const p = programs[i];
    await sql`
      INSERT INTO designer_programs (designer_id, program, cohort, year, sort_order)
      VALUES (${id}, ${p.program}, ${p.cohort}, ${p.year}, ${i})
    `;
  }
  for (let i = 0; i < links.length; i++) {
    await sql`
      INSERT INTO designer_links (designer_id, type, url, sort_order)
      VALUES (${id}, ${links[i].type}, ${links[i].url}, ${i})
    `;
  }

  console.log(`Seeded designer #${id} — /designer/${designer.slug}`);
  if (missing.length) console.log("Missing taxonomy terms (skipped):", missing.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
