import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group mb-6 block break-inside-avoid overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-950"
    >
      <div
        className={`aspect-[4/5] w-full bg-gradient-to-br ${project.gradient} transition-transform duration-500 group-hover:scale-105`}
      />
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <h3 className="font-medium text-zinc-950 dark:text-zinc-50">{project.title}</h3>
          <p className="text-sm text-zinc-500">{project.client}</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          {project.category}
        </span>
      </div>
    </Link>
  );
}
