import { Gallery } from "@/components/gallery";
import { getCurators } from "@/lib/db/curators";

// ISR: the gallery is regenerated at most once an hour (and immediately
// on an admin edit via revalidatePath). Keeps the small Timeweb instance from
// being queried on every visit.
export const revalidate = 3600;

export default async function Home() {
  const curators = await getCurators();
  return <Gallery curators={curators} />;
}
