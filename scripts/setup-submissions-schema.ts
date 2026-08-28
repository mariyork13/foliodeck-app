import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Minimal .env.local loader (no dotenv dependency) — same as setup-designers-schema.ts.
const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_submissions (
      id                 SERIAL PRIMARY KEY,
      name               TEXT NOT NULL,
      email              TEXT NOT NULL,
      contact            TEXT NOT NULL,
      specialization     TEXT NOT NULL,
      portfolio_url      TEXT NOT NULL,
      consent_processing BOOLEAN NOT NULL,
      consent_disclosure BOOLEAN NOT NULL,
      consent_ip         TEXT,
      consent_user_agent TEXT,
      consent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      status             TEXT NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new','review','approved','published','rejected','removed')),
      admin_note         TEXT,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS portfolio_submissions_status_created_idx
    ON portfolio_submissions (status, created_at DESC)
  `;

  console.log("Portfolio submissions schema ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
