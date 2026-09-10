import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/admin-auth";
import { isStorageConfigured, putObject } from "@/lib/storage";

export const runtime = "nodejs";
// Uploading to the Russian bucket from a US/EU function can be slow; give it room.
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // safety cap; client downscales before sending
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** `designers/<slug>-<random>.<ext>` — mirrors the old Vercel Blob layout. */
function objectKey(name: string, contentType: string): string {
  const base = name
    .split(/[/\\]/)
    .pop()!
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `designers/${base || "image"}-${randomUUID().slice(0, 8)}.${EXT[contentType] ?? "bin"}`;
}

// Receives the (client-downscaled) image and stores it in object storage
// (Yandex Cloud Object Storage — see src/lib/storage.ts). Auth is enforced
// here; /api/* is outside the proxy.ts matcher, same as Server Actions that
// call requireAdminSession().
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Нет доступа." }, { status: 401 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          "Хранилище не настроено. Задайте S3_ENDPOINT / S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY / MEDIA_PUBLIC_BASE и перезапустите сервер.",
      },
      { status: 503 },
    );
  }

  const contentType = (request.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json(
      { error: "Только изображения: jpeg, png, webp, gif, avif." },
      { status: 400 },
    );
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) {
    return NextResponse.json({ error: "Пустой файл." }, { status: 400 });
  }
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Файл слишком большой." }, { status: 413 });
  }

  const filename = request.headers.get("x-filename") ?? "image";

  const key = objectKey(filename, contentType);
  const body = new Uint8Array(bytes);

  try {
    const { url } = await putObject(key, body, contentType);
    return NextResponse.json({ url });
  } catch (error) {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("[blob-upload] putObject failed", detail);
    return NextResponse.json(
      { error: `Не удалось загрузить в хранилище (${detail}).` },
      { status: 502 },
    );
  }
}
