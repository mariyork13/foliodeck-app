// One-shot image migration: Vercel Blob -> Timeweb Object Storage (S3).
//
//   node scripts/migrate-images-to-ru.mjs           # copy + rewrite DB URLs
//   node scripts/migrate-images-to-ru.mjs --dry     # list what would move
//
// Runs AFTER scripts/migrate-to-ru.mjs (needs the target DB populated).
// Reads DATABASE_URL_RU and the S3_* / MEDIA_PUBLIC_BASE vars from .env.local.
// Idempotent: rows already pointing at MEDIA_PUBLIC_BASE are skipped.
//
// Image columns: designers.cover_image, curators.cover_image, curator_images.url

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import postgres from "postgres";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const g = (k) => {
  const m = env.match(new RegExp(`^${k}="?([^"\\n]+)"?`, "m"));
  if (!m) throw new Error(`${k} not found in .env.local`);
  return m[1];
};

const DRY = process.argv.includes("--dry");
const PUBLIC_BASE = g("MEDIA_PUBLIC_BASE").replace(/\/+$/, "");
const BUCKET = g("S3_BUCKET");

const sql = postgres(g("DATABASE_URL_RU"), { ssl: "require", max: 1, onnotice: () => {} });
const s3 = new S3Client({
  endpoint: g("S3_ENDPOINT"),
  region: g("S3_REGION"),
  forcePathStyle: true,
  credentials: { accessKeyId: g("S3_ACCESS_KEY_ID"), secretAccessKey: g("S3_SECRET_ACCESS_KEY") },
});

const CT = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  gif: "image/gif", avif: "image/avif",
};

/** designers/foo-1234.png  <-  https://<store>.blob.vercel-storage.com/designers/foo-1234.png */
function keyFromBlobUrl(url) {
  return new URL(url).pathname.replace(/^\/+/, "");
}

async function moveOne(url) {
  if (url.startsWith(PUBLIC_BASE + "/")) return { url, moved: false };
  const key = keyFromBlobUrl(url);
  if (DRY) {
    console.log(`  would copy  ${url}\n           -> ${PUBLIC_BASE}/${key}`);
    return { url: `${PUBLIC_BASE}/${key}`, moved: true };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  const body = new Uint8Array(await res.arrayBuffer());
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: res.headers.get("content-type") || CT[ext] || "application/octet-stream",
      ACL: "public-read",
    }),
  );
  console.log(`  ${key}  (${body.length} bytes)`);
  return { url: `${PUBLIC_BASE}/${key}`, moved: true };
}

async function run() {
  let moved = 0;
  let skipped = 0;

  // designers.cover_image + curators.cover_image
  for (const table of ["designers", "curators"]) {
    const rows = await sql`
      SELECT id, cover_image FROM ${sql(table)}
      WHERE cover_image IS NOT NULL AND cover_image <> ''`;
    console.log(`\n${table}.cover_image — ${rows.length} row(s)`);
    for (const row of rows) {
      const { url, moved: didMove } = await moveOne(row.cover_image);
      if (!didMove) { skipped++; continue; }
      if (!DRY && url !== row.cover_image) {
        await sql`UPDATE ${sql(table)} SET cover_image = ${url} WHERE id = ${row.id}`;
      }
      moved++;
    }
  }

  // curator_images.url
  const imgs = await sql`SELECT id, url FROM curator_images WHERE url <> ''`;
  console.log(`\ncurator_images.url — ${imgs.length} row(s)`);
  for (const row of imgs) {
    const { url, moved: didMove } = await moveOne(row.url);
    if (!didMove) { skipped++; continue; }
    if (!DRY && url !== row.url) {
      await sql`UPDATE curator_images SET url = ${url} WHERE id = ${row.id}`;
    }
    moved++;
  }

  console.log(`\n${DRY ? "[dry run] " : ""}moved ${moved}, already-on-S3 ${skipped}`);

  if (!DRY) {
    const leftover = await sql`
      SELECT 'designers' t, count(*)::int n FROM designers WHERE cover_image LIKE '%vercel-storage.com%'
      UNION ALL SELECT 'curators', count(*)::int FROM curators WHERE cover_image LIKE '%vercel-storage.com%'
      UNION ALL SELECT 'curator_images', count(*)::int FROM curator_images WHERE url LIKE '%vercel-storage.com%'`;
    console.log("Remaining Vercel Blob refs:", Object.fromEntries(leftover.map((r) => [r.t, r.n])));
  }

  await sql.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
