import { Gallery } from "@/components/gallery";
import { getCurators } from "@/lib/db/curators";

// ISR: the gallery is regenerated at most once every 2 minutes (and immediately
// on an admin edit via revalidatePath). Keeps the small Timeweb instance from
// being queried on every visit.
export const revalidate = 120;

export default async function Home() {
  const curators = await getCurators();
  return <Gallery curators={curators} />;
}
