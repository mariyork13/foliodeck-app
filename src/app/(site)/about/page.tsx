export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-6 text-[22px] font-medium text-white/90">About the project</h1>

      <div className="space-y-4 text-base text-white/60">
        <p>
          A curated gallery of portfolios from designers around the world, across many
          disciplines. The gallery features 705 portfolios with strong storytelling, clear case
          structure, and rich visuals.
        </p>
        <p>
          This project grew out of my mentorship program for designers, where we break down
          portfolios, storytelling, visual decisions, and best practices — and also build
          portfolio design concepts for participants. Over time I built up observations about
          what strong portfolios look like and which patterns keep repeating.
        </p>
        <p>
          That&apos;s how the idea came about to collect a curated portfolio gallery in one place.
          Here designers can study other people&apos;s work, spot what works, notice trends, and
          find inspiration not just in product cases but in digital and multidisciplinary design
          too. Almost every portfolio has curator comments (from me) — I note what caught my eye,
          which decisions are strong, and which practices might be useful to others.
        </p>
      </div>

      <h2 className="mb-6 mt-12 text-[22px] font-medium text-white/90">Talent Hub</h2>

      <div className="space-y-4 text-base text-white/60">
        <p>
          A selection of designers who took part in the &quot;Design Awesome&quot; mentorship
          programs. Here you can check out their work and approach, and see how their portfolios
          have grown over time. The collection keeps growing, and I personally review every
          submission.
        </p>
        <p>If you&apos;d like to submit your portfolio, send it through the form. I&apos;d love any feedback.</p>
      </div>
    </article>
  );
}
