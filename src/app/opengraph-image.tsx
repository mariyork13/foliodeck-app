import { ImageResponse } from "next/og";
import { getCurators } from "@/lib/db/curators";
import { OG_SIZE, fetchOgImage, loadOgFonts } from "@/lib/og";

// Default link preview for every page that doesn't have its own
// (curator pages generate theirs in curator/[slug]/opengraph-image.tsx).
// Light card: headline + a strip of real portfolio screenshots from the top of
// the gallery, refreshed hourly so it follows the gallery order.
export const revalidate = 3600;
export const alt = "Foliodeck — a curated portfolio gallery";
export const size = OG_SIZE;
export const contentType = "image/png";

const INK = "#161618";
const STRIP_COUNT = 5;
const SHOT = { width: 250, height: 230 };

async function loadStrip(): Promise<(string | null)[]> {
  const curators = await getCurators();
  // Fetch a few spares in parallel — some preview links are dead.
  const candidates = curators.slice(0, STRIP_COUNT * 2);
  const images = await Promise.all(candidates.map((c) => fetchOgImage(c.coverImage || c.previewImage, SHOT.width * 2)));
  const loaded = images.filter((img): img is string => img !== null).slice(0, STRIP_COUNT);
  // Pad with blank tiles so the strip never collapses if the CDN is down.
  return [...loaded, ...Array<null>(STRIP_COUNT - loaded.length).fill(null)];
}

export default async function Image() {
  const [fonts, strip] = await Promise.all([loadOgFonts(), loadStrip()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px 0",
          background: "#F4F4F2",
          fontFamily: "Roboto",
          color: INK,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 500, lineHeight: 1.04, letterSpacing: -2, width: 700 }}>
              A curated portfolio gallery
            </div>
            <div style={{ marginTop: 20, fontSize: 28, color: "rgba(22,22,24,0.5)" }}>
              700+ portfolios · curator notes · foliodeck.pro
            </div>
          </div>
          <svg width={64} height={64} viewBox="8 8 48 48" fill="none">
            <path
              d="M8 52C8 54.2091 9.79086 56 12 56H31.8788C32.9396 56 33.9571 55.5786 34.7072 54.8284L54.8284 34.7072C55.5786 33.9571 56 32.9396 56 31.8788V12C56 9.79086 54.2091 8 52 8H32.1212C31.0604 8 30.0429 8.42143 29.2928 9.17157L9.17157 29.2928C8.42143 30.0429 8 31.0603 8 32.1212V52Z"
              fill={INK}
            />
          </svg>
        </div>

        <div style={{ display: "flex", gap: 20, marginLeft: -40 }}>
          {strip.map((src, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexShrink: 0,
                ...SHOT,
                overflow: "hidden",
                borderRadius: "14px 14px 0 0",
                border: "1px solid rgba(0,0,0,0.08)",
                borderBottom: "none",
                background: "#E6E6E3",
              }}
            >
              {src && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img src={src} {...SHOT} style={{ objectFit: "cover", objectPosition: "top" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
