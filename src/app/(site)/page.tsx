import { Gallery } from "@/components/gallery";
import { curators } from "@/lib/curators";

export default function Home() {
  return <Gallery curators={curators} />;
}
