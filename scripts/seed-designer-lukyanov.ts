import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { slugify } from "../src/lib/designers/slug";

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

// Tenth example student — Дмитрий Лукьянов. Editable afterwards in the admin form.
const designer = {
  slug: "dmitry-lukyanov",
  first_name: "Дмитрий",
  last_name: "Лукьянов",
  cover_image: null as string | null, // TODO: add a cover image URL in the editor
  grade: "Senior",
  years_of_experience: 5,
  open_to_work: true,
};

const newTerms: [string, string][] = [["industry", "GameDev"]];

const taxonomy: Record<string, string[]> = {
  platform: ["Web", "Mobile", "iOS", "Android"],
  business_model: ["B2B", "B2C", "B2E"],
  industry: ["Fintech", "HealthTech", "Industrial / Manufacturing", "GameDev"],
  interface_type: ["ERP", "Admin panels", "Data-heavy interfaces"],
  skill: ["Design systems", "UI", "Web design", "Mobile design", "Research"],
  company_type: ["Agency"],
};

const links = [{ type: "telegram", url: "https://t.me/kamalledln" }];

async function main() {
  for (const [category, name] of newTerms) {
    const slug = slugify(name) || name.toLowerCase();
    await sql`
      INSERT INTO taxonomy (category, name, slug, sort_order)
      VALUES (${category}, ${name}, ${slug},
        COALESCE((SELECT MAX(sort_order) FROM taxonomy WHERE category = ${category}), 0) + 1)
      ON CONFLICT (category, slug) DO NOTHING
    `;
  }

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
