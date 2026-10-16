import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared bits for the opengraph-image routes (link previews in LinkedIn,
// Telegram, Slack…). ImageResponse's built-in font has no Cyrillic, so we ship
// Roboto ourselves.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_BG = "#161618";

export async function loadOgFonts() {
  const dir = join(process.cwd(), "src/assets/fonts");
  const [regular, medium] = await Promise.all([
    readFile(join(dir, "Roboto-Regular.ttf")),
    readFile(join(dir, "Roboto-Medium.ttf")),
  ]);
  return [
    { name: "Roboto", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Roboto", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

/** The Foliodeck mark from app/icon.svg + wordmark. */
export function OgBrand({ size = 44 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={size} height={size} viewBox="8 8 48 48" fill="none">
        <path
          d="M8 52C8 54.2091 9.79086 56 12 56H31.8788C32.9396 56 33.9571 55.5786 34.7072 54.8284L54.8284 34.7072C55.5786 33.9571 56 32.9396 56 31.8788V12C56 9.79086 54.2091 8 52 8H32.1212C31.0604 8 30.0429 8.42143 29.2928 9.17157L9.17157 29.2928C8.42143 30.0429 8 31.0603 8 32.1212V52Z"
          fill="white"
          fillOpacity="0.9"
        />
      </svg>
      <div style={{ fontSize: size * 0.72, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>Foliodeck</div>
    </div>
  );
}

/**
 * Fetches a remote image and inlines it as a data URI, or returns null if it's
 * missing/slow/not a format ImageResponse can draw. Preview links are often
 * dead Tilda URLs, so the card must render without one.
 */
export async function fetchOgImage(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!/^image\/(png|jpe?g|gif)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type.split(";")[0]};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
