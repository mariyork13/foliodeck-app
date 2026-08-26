import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50">
        ← Back to work
      </Link>

      <header className="mt-6 mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-black/5 pb-8 dark:border-white/10">
        <div>
          <span className="text-sm font-medium text-zinc-500">
            {project.category} · {project.year}
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            {project.title}
          </h1>
          <p className="mt-1 text-zinc-500">{project.client}</p>
        </div>
      </header>

      <p className="mb-10 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">{project.description}</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {Array.from({ length: project.imageCount }).map((_, index) => (
          <div
            key={index}
            className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${project.gradient} ${
              index === 0 ? "sm:col-span-2 sm:aspect-[16/9]" : ""
            }`}
          />
        ))}
      </div>
    </article>
  );
}
