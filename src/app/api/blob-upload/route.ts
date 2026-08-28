import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // safety cap; client downscales before sending
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function safePathname(name: string): string {
  const cleaned = name
    .split(/[/\\]/)
    .pop()!
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `designers/${cleaned || "image"}`;
}

// Receives the (client-downscaled) image and stores it in Vercel Blob using the
// project's OIDC credentials (VERCEL_OIDC_TOKEN + BLOB_STORE_ID) — no static
// BLOB_READ_WRITE_TOKEN needed. Auth is enforced here; /api/* is outside the
// proxy.ts matcher, same as Server Actions calling requireAdminSession().
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Нет доступа." }, { status: 401 });
  }

  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Хранилище не настроено. Создайте публичный Blob-стор в Vercel и выполните `vercel env pull .env.local`, затем перезапустите dev-сервер.",
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
    const blob = await put(safePathname(filename), bytes, {
      access: "public",
      addRandomSuffix: true,
      contentType,
      // Local dev uses the static store token; on Vercel this is undefined and
      // the SDK falls back to the project's OIDC credentials.
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить.";
    return NextResponse.json(
      {
        error: /private store/i.test(message)
          ? "Blob-стор приватный. Нужен публичный стор (Access: Public), пересоздайте его в Vercel."
          : /oidc|token|expired|credentials/i.test(message)
            ? "Учётные данные Blob истекли. Выполните `vercel env pull .env.local` и перезапустите dev-сервер."
            : message,
      },
      { status: 400 },
    );
  }
}
