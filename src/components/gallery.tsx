"use client";

import { useMemo, useState } from "react";
import { categories } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./project-card";

export function Gallery({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>("All");

  const filtered = useMemo(
    () => (active === "All" ? projects : projects.filter((p) => p.category === active)),
    [projects, active],
  );

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActive(category)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === category
                ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-zinc-500">No projects in this category yet.</p>
      )}
    </section>
  );
}
