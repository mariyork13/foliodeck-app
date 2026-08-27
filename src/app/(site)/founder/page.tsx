function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-white/90 hover:text-white"
    >
      {children}
    </a>
  );
}

export default function FounderPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-6 text-[22px] font-medium text-white/90">About the curator</h1>

      <div className="space-y-4 text-base text-white/60">
        <p>
          My name is <span className="font-medium text-white/90">Masha Chubina</span> :) Product
          Design Lead with 10 years of industry experience. You can check out my own portfolio
          here too.
        </p>
        <p>
          Right now I work as a career coach and mentor for product and UX/UI designers. I&apos;ve
          built 2 original training programs and help designers grow systematically in their
          careers.
        </p>
        <p>
          I do <span className="font-medium text-white/90">portfolio and resume breakdowns</span>{" "}
          for designers on <ExtLink href="https://www.youtube.com/@design_awesome">YouTube</ExtLink>{" "}
          and on <ExtLink href="https://t.me/design_awesome">Telegram &quot;Design Awesome&quot;</ExtLink>,
          host live streams with experts, and grow a professional community. I share practical
          tools, career strategies, and real experience from the product world.
        </p>
        <p>
          Through my projects I help designers build a sharper eye, pick up the best career
          practices, gain experience, and move their careers forward with confidence.
        </p>
        <p>
          Message me on <ExtLink href="https://t.me/chubina_mv">Telegram</ExtLink> and{" "}
          <ExtLink href="https://www.linkedin.com/in/maria-chubina-25a659a8/">LinkedIn</ExtLink>.
        </p>
        <p>And do send me your portfolio :)</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://static.tildacdn.com/tild3036-6666-4962-b530-353861666364/1.jpg"
          alt="Masha Chubina"
          className="aspect-[452/366] w-full rounded-lg object-cover"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://static.tildacdn.com/tild3230-3265-4432-b033-393364623637/2.jpg"
          alt="Masha Chubina"
          className="aspect-[452/366] w-full rounded-lg object-cover"
        />
      </div>
    </article>
  );
}
