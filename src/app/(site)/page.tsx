import { Gallery } from "@/components/gallery";
import { getCurators } from "@/lib/db/curators";

// Curator data now lives in Postgres and changes via the admin panel, so this
// page must be rendered fresh per request rather than snapshotted at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const curators = await getCurators();
  return <Gallery curators={curators} />;
}
