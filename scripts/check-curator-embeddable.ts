import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Detects which portfolio sites can be shown in an <iframe> on /curator/[slug].
// A site is NOT embeddable if it sends X-Frame-Options, or a CSP that restricts
// frame-ancestors, or it can't be reached. Stores curators.embeddable.
// Run once now, and again after adding portfolios / periodically.

const envLocal = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envLocal.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match) process.env[match[1]] ??= match[2];
}

const sql = neon(process.env.DATABASE_URL!);
const CONCURRENCY = 10;

async function isEmbeddable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; foliodeck-embed-check)" },
      signal: AbortSignal.timeout(15000),
    });
    const xfo = res.headers.get("x-frame-options");
    if (xfo && /deny|sameorigin|allow-from/i.test(xfo)) return false;

    const csp = res.headers.get("content-security-policy") ?? "";
    const fa = csp.match(/frame-ancestors([^;]*)/i);
    if (fa && !/[\s:]\*(\s|$)/.test(fa[1])) return false;

    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  await sql`ALTER TABLE curators ADD COLUMN IF NOT EXISTS embeddable BOOLEAN`;

  const rows = (await sql`
    SELECT id, external_url FROM curators WHERE external_url <> '' ORDER BY id
  `) as { id: number; external_url: string }[];

  const queue = [...rows];
  let done = 0;
  let blocked = 0;

  async function worker() {
    while (queue.length) {
      const row = queue.shift();
      if (!row) return;
      const ok = await isEmbeddable(row.external_url);
      if (!ok) blocked++;
      await sql`UPDATE curators SET embeddable = ${ok} WHERE id = ${row.id}`;
      done++;
      if (done % 50 === 0) console.log(`  ${done}/${rows.length} (${blocked} not embeddable)`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Done. ${rows.length - blocked} embeddable, ${blocked} need a manual cover.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
