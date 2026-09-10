// One-shot data migration: Neon (DATABASE_URL) -> Timeweb Cloud (DATABASE_URL_RU).
//
//   node scripts/migrate-to-ru.mjs           # schema + data + sequences + verify
//   node scripts/migrate-to-ru.mjs --verify  # only re-check row counts
//
// Reads both connection strings from .env.local. Safe to re-run: it drops and
// recreates the public schema on the target every time. Source is read-only.
//
// The schema here is written by hand (source is PG 18, target PG 17 — pg_dump
// across that gap is fragile, and the schema is small and stable). Keep it in
// sync with any future migrations to the Neon database.

import postgres from "postgres";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const pick = (k) => {
  const m = env.match(new RegExp(`^${k}="?([^"\\n]+)"?`, "m"));
  if (!m) throw new Error(`${k} not found in .env.local`);
  return m[1];
};

const src = postgres(pick("DATABASE_URL"), { max: 1, onnotice: () => {} });
const dst = postgres(pick("DATABASE_URL_RU"), { ssl: "require", max: 1, onnotice: () => {} });

// Parents before children (FK order). Same list drives copy + verification.
const TABLES = [
  "tags",
  "taxonomy",
  "curators",
  "designers",
  "curator_images",
  "curator_tags",
  "designer_images",
  "designer_links",
  "designer_programs",
  "designer_taxonomy",
  "portfolio_submissions",
];

const SEQUENCES = {
  curators: "curators_id_seq",
  designers: "designers_id_seq",
  tags: "tags_id_seq",
  taxonomy: "taxonomy_id_seq",
  curator_images: "curator_images_id_seq",
  designer_images: "designer_images_id_seq",
  designer_links: "designer_links_id_seq",
  designer_programs: "designer_programs_id_seq",
  portfolio_submissions: "portfolio_submissions_id_seq",
};

const DDL = `
DROP TABLE IF EXISTS
  portfolio_submissions, designer_taxonomy, designer_programs, designer_links,
  designer_images, curator_tags, curator_images, designers, curators,
  taxonomy, tags
CASCADE;

CREATE TABLE tags (
  id     serial PRIMARY KEY,
  type   text NOT NULL CHECK (type IN ('specialization','company','collection')),
  name   text NOT NULL,
  UNIQUE (type, name)
);

CREATE TABLE taxonomy (
  id         serial PRIMARY KEY,
  category   text NOT NULL CHECK (category IN ('platform','business_model','industry','interface_type','skill','company_type')),
  name       text NOT NULL,
  slug       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (category, slug)
);
CREATE INDEX taxonomy_category_idx ON taxonomy (category);

CREATE TABLE curators (
  id            serial PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  role          text NOT NULL,
  external_url  text NOT NULL,
  preview_image text NOT NULL,
  geo           text,
  notes         text,
  sort_order    integer NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  cover_image   text,
  embeddable    boolean
);
CREATE INDEX curators_sort_order_idx ON curators (sort_order, id);
CREATE INDEX curators_geo_idx ON curators (geo);

CREATE TABLE designers (
  id                  serial PRIMARY KEY,
  slug                text NOT NULL UNIQUE,
  first_name          text NOT NULL,
  last_name           text NOT NULL,
  cover_image         text,
  grade               text NOT NULL,
  years_of_experience integer,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  open_to_work        boolean NOT NULL DEFAULT false
);
CREATE INDEX designers_name_idx ON designers (last_name, first_name);
CREATE INDEX designers_created_at_idx ON designers (created_at DESC, id DESC);

CREATE TABLE curator_images (
  id         serial PRIMARY KEY,
  curator_id integer NOT NULL REFERENCES curators(id) ON DELETE CASCADE,
  url        text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
CREATE INDEX curator_images_curator_id_idx ON curator_images (curator_id);

CREATE TABLE curator_tags (
  curator_id integer NOT NULL REFERENCES curators(id) ON DELETE CASCADE,
  tag_id     integer NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (curator_id, tag_id)
);
CREATE INDEX curator_tags_tag_id_idx ON curator_tags (tag_id);

CREATE TABLE designer_images (
  id          serial PRIMARY KEY,
  designer_id integer NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  url         text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);
CREATE INDEX designer_images_designer_id_idx ON designer_images (designer_id);

CREATE TABLE designer_links (
  id          serial PRIMARY KEY,
  designer_id integer NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  type        text NOT NULL,
  url         text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);
CREATE INDEX designer_links_designer_id_idx ON designer_links (designer_id);

CREATE TABLE designer_programs (
  id          serial PRIMARY KEY,
  designer_id integer NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  program     text NOT NULL,
  cohort      text NOT NULL,
  year        integer NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);
CREATE INDEX designer_programs_designer_id_idx ON designer_programs (designer_id);

CREATE TABLE designer_taxonomy (
  designer_id integer NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  taxonomy_id integer NOT NULL REFERENCES taxonomy(id) ON DELETE CASCADE,
  PRIMARY KEY (designer_id, taxonomy_id)
);
CREATE INDEX designer_taxonomy_taxonomy_id_idx ON designer_taxonomy (taxonomy_id);

CREATE TABLE portfolio_submissions (
  id                 serial PRIMARY KEY,
  name               text NOT NULL,
  email              text NOT NULL,
  contact            text NOT NULL,
  specialization     text NOT NULL,
  portfolio_url      text NOT NULL,
  consent_processing boolean NOT NULL,
  consent_disclosure boolean NOT NULL,
  consent_ip         text,
  consent_user_agent text,
  consent_at         timestamptz NOT NULL DEFAULT now(),
  status             text NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new','review','approved','published','rejected','removed')),
  admin_note         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portfolio_submissions_status_created_idx ON portfolio_submissions (status, created_at DESC);
`;

async function verify() {
  let ok = true;
  for (const t of TABLES) {
    const [a] = await src`SELECT count(*)::int n FROM ${src(t)}`;
    const [b] = await dst`SELECT count(*)::int n FROM ${dst(t)}`;
    const mark = a.n === b.n ? "ok" : "MISMATCH";
    if (a.n !== b.n) ok = false;
    console.log(`  ${t.padEnd(24)} src=${String(a.n).padStart(5)}  dst=${String(b.n).padStart(5)}  ${mark}`);
  }
  return ok;
}

async function main() {
  if (process.argv.includes("--verify")) {
    console.log("Row counts:");
    process.exit((await verify()) ? 0 : 1);
  }

  console.log("1/4  Recreating schema on target…");
  await dst.unsafe(DDL);

  console.log("2/4  Copying data…");
  for (const t of TABLES) {
    const rows = await src`SELECT * FROM ${src(t)}`;
    if (rows.length) await dst`INSERT INTO ${dst(t)} ${dst(rows)}`;
    console.log(`  ${t.padEnd(24)} ${rows.length} rows`);
  }

  console.log("3/4  Resetting sequences…");
  for (const [t, seq] of Object.entries(SEQUENCES)) {
    await dst.unsafe(
      `SELECT setval('${seq}', GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${t}), 1),
         (SELECT COUNT(*) > 0 FROM ${t}))`,
    );
  }

  console.log("4/4  Verifying row counts:");
  const ok = await verify();

  await src.end();
  await dst.end();
  console.log(ok ? "\nDone. ✓" : "\nDone with MISMATCHES — investigate before cutover.");
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
