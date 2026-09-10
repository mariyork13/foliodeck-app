import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

// Object storage for uploaded images (curator covers, designer covers/gallery).
// Timeweb Cloud Object Storage (S3-compatible, path-style):
//   S3_ENDPOINT=https://s3.twcstorage.ru
//   S3_REGION=ru-1
//   S3_BUCKET=foliodeck-media
//   MEDIA_PUBLIC_BASE=https://s3.twcstorage.ru/foliodeck-media
// The bucket is public, so stored URLs are plain `${MEDIA_PUBLIC_BASE}/${key}`
// and load directly from an <img>.

const PUBLIC_BASE = (process.env.MEDIA_PUBLIC_BASE ?? "").replace(/\/+$/, "");

let client: S3Client | null = null;
function s3(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION ?? "ru-1",
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      PUBLIC_BASE,
  );
}

/** True for URLs that live in our own bucket (safe to delete on cleanup). */
export function isOwnedMediaUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && PUBLIC_BASE !== "" && url.startsWith(PUBLIC_BASE + "/");
}

function keyFromUrl(url: string): string | null {
  return isOwnedMediaUrl(url) ? url.slice(PUBLIC_BASE.length + 1) : null;
}

/** Store bytes at `key` and return the public URL. */
export async function putObject(
  key: string,
  body: Uint8Array | Buffer,
  contentType: string,
): Promise<{ url: string }> {
  await s3().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      // bucket ACL already grants public-read on this prefix; this keeps it
      // explicit for buckets configured per-object.
      ACL: "public-read",
    }),
  );
  return { url: `${PUBLIC_BASE}/${key}` };
}

/** Best-effort delete of objects we own. Ignores anything hosted elsewhere. */
export async function deleteObjects(urls: string[]): Promise<void> {
  const keys = urls.map(keyFromUrl).filter((k): k is string => k !== null);
  if (keys.length === 0) return;
  await s3().send(
    new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET!,
      Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    }),
  );
}
