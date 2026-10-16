// Renders the site-wide OG card (light layout, dark palette) to a static PNG.
//   node --env-file=.env.local scripts/render-og-image.mjs src/app/opengraph-image.png
// Re-run when the top of the gallery changes; the PNG is committed as a static file.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(join(root, "package.json"));
const React = require("react");
const postgres = require("postgres");
const sharp = require("sharp");
const { ImageResponse } = await import(join(root, "node_modules/next/dist/compiled/@vercel/og/index.node.js"));
const h = React.createElement;

const fonts = [
  { name: "Roboto", data: await readFile(join(root, "src/assets/fonts/Roboto-Regular.ttf")), weight: 400, style: "normal" },
  { name: "Roboto", data: await readFile(join(root, "src/assets/fonts/Roboto-Medium.ttf")), weight: 500, style: "normal" },
];

const SHOT = { width: 250, height: 230 };
const sql = postgres(process.env.DATABASE_URL);
const rows = await sql`SELECT preview_image, cover_image FROM curators ORDER BY sort_order, id LIMIT 12`;
await sql.end();
const imgs = (
  await Promise.all(
    rows.map(async (r) => {
      try {
        const res = await fetch(r.cover_image || r.preview_image, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return null;
        const jpeg = await sharp(Buffer.from(await res.arrayBuffer())).resize({ width: SHOT.width * 2 }).jpeg({ quality: 85 }).toBuffer();
        return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
      } catch {
        return null;
      }
    }),
  )
)
  .filter(Boolean)
  .slice(0, 5);
console.log("shots:", imgs.length);

const MARK =
  "M8 52C8 54.2091 9.79086 56 12 56H31.8788C32.9396 56 33.9571 55.5786 34.7072 54.8284L54.8284 34.7072C55.5786 33.9571 56 32.9396 56 31.8788V12C56 9.79086 54.2091 8 52 8H32.1212C31.0604 8 30.0429 8.42143 29.2928 9.17157L9.17157 29.2928C8.42143 30.0429 8 31.0603 8 32.1212V52Z";
const div = (style, ...children) => h("div", { style: { display: "flex", ...style } }, ...children);

const el = div(
  { width: "100%", height: "100%", background: "#161618", color: "white", fontFamily: "Roboto", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 0" },
  div(
    { justifyContent: "space-between", alignItems: "flex-start" },
    div(
      { flexDirection: "column" },
      div({ fontSize: 76, fontWeight: 500, lineHeight: 1.04, letterSpacing: -2, width: 700, color: "rgba(255,255,255,0.92)" }, "A curated portfolio gallery"),
      div({ marginTop: 20, fontSize: 28, color: "rgba(255,255,255,0.5)" }, "700+ portfolios · curator notes · foliodeck.pro"),
    ),
    h("svg", { width: 64, height: 64, viewBox: "8 8 48 48", fill: "none" }, h("path", { d: MARK, fill: "white", fillOpacity: 0.9 })),
  ),
  div(
    { gap: 20, marginLeft: -40 },
    ...imgs.map((src) =>
      div(
        { ...SHOT, flexShrink: 0, overflow: "hidden", borderRadius: "14px 14px 0 0", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none", background: "#2A2A2E" },
        h("img", { src, ...SHOT, style: { objectFit: "cover", objectPosition: "top" } }),
      ),
    ),
  ),
);

const res = new ImageResponse(el, { width: 1200, height: 630, fonts });
await writeFile(process.argv[2], Buffer.from(await res.arrayBuffer()));
console.log("wrote", process.argv[2]);
