import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getCuratorBySlug } from "@/lib/db/curators";
import { OG_BG, OG_SIZE, OgBrand, fetchOgImage, loadOgFonts } from "@/lib/og";

// Per-curator link preview: name, role, specializations and the portfolio
// screenshot. Cached like the page itself; admin edits don't purge it, so a
// renamed curator's preview catches up within the revalidate window.
export const revalidate = 300;
export const alt = "Portfolio on Foliodeck";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const curator = await getCuratorBySlug(slug);
  if (!curator) notFound();

  const [fonts, shot] = await Promise.all([
    loadOgFonts(),
    fetchOgImage(curator.coverImage || curator.previewImage),
  ]);
  const tags = curator.specializations.slice(0, 3);

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
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, flex: 1 }}>
          <OgBrand size={36} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: curator.name.length > 22 ? 52 : 64,
                fontWeight: 500,
                lineHeight: 1.08,
                letterSpacing: -1.2,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {curator.name}
            </div>
            {curator.role && (
              <div style={{ marginTop: 16, fontSize: 30, lineHeight: 1.3, color: "rgba(255,255,255,0.5)" }}>
                {curator.role}
              </div>
            )}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      fontSize: 20,
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.35)" }}>Curated portfolio · foliodeck.pro</div>
        </div>

        {shot && (
          <div style={{ display: "flex", width: 520, padding: "48px 48px 0 0" }}>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "none",
                background: "#2A2A2E",
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img src={shot} width={472} height={582} style={{ objectFit: "cover", objectPosition: "top" }} />
            </div>
          </div>
        )}
      </div>
    ),
    { ...size, fonts },
  );
}
