import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/admin-auth";
import { isStorageConfigured, putObject } from "@/lib/storage";

export const runtime = "nodejs";

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

  try {
    const { url } = await putObject(objectKey(filename, contentType), new Uint8Array(bytes), contentType);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
