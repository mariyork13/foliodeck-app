import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

// Twentieth example student — Шахноза Равшанова. Editable afterwards in the admin form.
const designer = {
  slug: "shahnoza-ravshanova",
  first_name: "Шахноза",
  last_name: "Равшанова",
  cover_image: null as string | null, // TODO: add a cover image URL in the editor
  grade: "Middle",
  years_of_experience: 2, // "2+"
  open_to_work: true,
};

const taxonomy: Record<string, string[]> = {
  platform: ["Web", "Mobile", "iOS", "Android"],
  business_model: ["B2C", "B2B", "B2B2C"],
  industry: ["FoodTech", "Industrial / Manufacturing", "Logistics"],
  interface_type: ["Dashboards", "Data-heavy interfaces", "Admin panels"],
  skill: ["Data-heavy interfaces", "Research", "Design systems", "UI", "Mobile design", "Web design"],
  company_type: ["Startup"],
};

const links = [{ type: "telegram", url: "https://t.me/shahnozars" }];

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
