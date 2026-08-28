/** True for URLs that live in our Vercel Blob store (safe to delete on cleanup). */
export function isBlobUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && /\.blob\.vercel-storage\.com\//.test(url);
}
