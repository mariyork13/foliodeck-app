import { ImageResponse } from "next/og";
import { OG_BG, OG_SIZE, OgBrand, loadOgFonts } from "@/lib/og";

// Default link preview for every page that doesn't have its own
// (curator pages generate theirs in curator/[slug]/opengraph-image.tsx).
export const alt = "Foliodeck — a curated portfolio gallery";
export const size = OG_SIZE;
export const contentType = "image/png";

// Gallery-ish tile wall on the right: a few lit cards among dim ones.
const TILES = [0.06, 0.1, 0.06, 0.14, 0.06, 0.1, 0.06, 0.1, 0.06];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: OG_BG,
          fontFamily: "Roboto",
          color: "white",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, flex: 1 }}>
          <OgBrand />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, fontWeight: 500, lineHeight: 1.08, letterSpacing: -1.5, color: "rgba(255,255,255,0.92)" }}>
              A curated portfolio gallery
            </div>
            <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.35, color: "rgba(255,255,255,0.5)", maxWidth: 600 }}>
              700+ portfolios of designers and studios, with curator notes on what works.
            </div>
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.35)" }}>foliodeck.pro</div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            width: 412,
            padding: "56px 56px 56px 0",
            alignContent: "center",
          }}
        >
          {TILES.map((alpha, i) => (
            <div
              key={i}
              style={{
                width: 108,
                height: 152,
                borderRadius: 10,
                background: `rgba(255,255,255,${alpha})`,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
