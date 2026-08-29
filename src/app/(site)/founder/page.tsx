"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-white/90 hover:text-white">
      {children}
    </a>
  );
}

function PortfolioLink({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/curator/masha-chubina" className="font-medium text-white hover:text-white/80">
      {children}
    </Link>
  );
}

function EnContent() {
  return (
    <>
      <h1 className="mb-6 text-[22px] font-medium text-white/90">About the curator</h1>
      <div className="space-y-4 text-base text-white/60">
        <p>
          My name is <span className="font-medium text-white/90">Masha Chubina</span>. Product Design Lead with 10
          years of industry experience. You can check out <PortfolioLink>my own portfolio</PortfolioLink> here too.
        </p>
        <p>
          Right now I work as a career coach and mentor for product and UX/UI designers. I&apos;ve built 2 original
          training programs and help designers grow systematically in their careers.
        </p>
        <p>
          I do <span className="font-medium text-white/90">portfolio and resume breakdowns</span> for designers on{" "}
          <ExtLink href="https://www.youtube.com/@design_awesome">YouTube</ExtLink> and on{" "}
          <ExtLink href="https://t.me/design_awesome">Telegram &quot;Design Awesome&quot;</ExtLink>, host live streams
          with experts, and grow a professional community. I share practical tools, career strategies, and real
          experience from the product world.
        </p>
        <p>
          Through my projects I help designers build a sharper eye, pick up the best career practices, gain
          experience, and move their careers forward with confidence.
        </p>
        <p>
          Message me on <ExtLink href="https://t.me/chubina_mv">Telegram</ExtLink> and{" "}
          <ExtLink href="https://www.linkedin.com/in/maria-chubina-25a659a8/">LinkedIn</ExtLink>.
        </p>
      </div>
    </>
  );
}

function RuContent() {
  return (
    <>
      <h1 className="mb-6 text-[22px] font-medium text-white/90">О кураторе</h1>
      <div className="space-y-4 text-base text-white/60">
        <p>
          Меня зовут <span className="font-medium text-white/90">Маша Чубина</span>. Product Design Lead с 10-летним
          опытом в индустрии. Здесь же можно посмотреть <PortfolioLink>моё собственное портфолио</PortfolioLink>.
        </p>
        <p>
          Сейчас я работаю карьерным коучем и ментором для продуктовых и UX/UI дизайнеров. Я создала 2 авторские
          программы обучения и помогаю дизайнерам системно расти в карьере.
        </p>
        <p>
          Я делаю <span className="font-medium text-white/90">разборы портфолио и резюме</span> для дизайнеров на{" "}
          <ExtLink href="https://www.youtube.com/@design_awesome">YouTube</ExtLink> и в{" "}
          <ExtLink href="https://t.me/design_awesome">Telegram «Design Awesome»</ExtLink>, провожу эфиры с экспертами
          и развиваю профессиональное сообщество. Делюсь практическими инструментами, карьерными стратегиями и
          реальным опытом из продуктового мира.
        </p>
        <p>
          В своих проектах я помогаю дизайнерам развивать насмотренность, перенимать лучшие карьерные практики,
          получать опыт и увереннее двигаться вперёд в карьере.
        </p>
        <p>
          Пишите мне в <ExtLink href="https://t.me/chubina_mv">Telegram</ExtLink> и{" "}
          <ExtLink href="https://www.linkedin.com/in/maria-chubina-25a659a8/">LinkedIn</ExtLink>.
        </p>
      </div>
    </>
  );
}

export default function FounderPage() {
  const { language } = useLanguage();

  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-4 sm:pt-16">
      {language === "ru" ? <RuContent /> : <EnContent />}

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
