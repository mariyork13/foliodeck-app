import { Gallery } from "@/components/gallery";
import { Hero } from "@/components/hero";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <>
      <Hero />
      <Gallery projects={projects} />
    </>
  );
}
