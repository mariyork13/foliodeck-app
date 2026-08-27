export default function FounderPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold text-white/90">О кураторе</h1>

      <div className="space-y-4 text-white/60">
        <p>
          Меня зовут <span className="font-medium text-white/90">Маша Чубина</span> :) Product Design Lead с
          10 годами опыта в индустрии. Моё портфолио тоже можно посмотреть здесь.
        </p>
        <p>
          Сейчас я работаю карьерным практиком и ментором для продуктовых и UX/UI-дизайнеров. Разработала 2
          авторские обучающие программы и помогаю системно расти в профессии.
        </p>
        <p>
          Делаю <span className="font-medium text-white/90">разборы портфолио и резюме</span> дизайнеров на{" "}
          <a
            href="https://www.youtube.com/@design_awesome"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/90 underline underline-offset-2 hover:text-white"
          >
            YouTube↗
          </a>{" "}
          и в{" "}
          <a
            href="https://t.me/design_awesome"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/90 underline underline-offset-2 hover:text-white"
          >
            Telegram «Дизайн тащит»↗
          </a>
          , провожу эфиры с экспертами и развиваю профессиональное комьюнити. Делюсь практическими
          инструментами, карьерными стратегиями и реальным опытом из продуктовой среды.
        </p>
        <p>
          Через свои проекты помогаю дизайнерам развивать насмотренность, осваивать лучшие карьерные
          практики, набираться опыта и уверенно продвигаться в карьере.
        </p>
        <p>
          Пишите мне в{" "}
          <a
            href="https://t.me/chubina_mv"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/90 underline underline-offset-2 hover:text-white"
          >
            Telegram↗
          </a>{" "}
          и{" "}
          <a
            href="https://www.linkedin.com/in/maria-chubina-25a659a8/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/90 underline underline-offset-2 hover:text-white"
          >
            LinkedIn↗
          </a>
          .
        </p>
        <p>Ну и присылайте свои портфолио :)</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://static.tildacdn.com/tild3036-6666-4962-b530-353861666364/1.jpg"
          alt="Маша Чубина"
          className="aspect-[452/366] w-full rounded-lg object-cover"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://static.tildacdn.com/tild3230-3265-4432-b033-393364623637/2.jpg"
          alt="Маша Чубина"
          className="aspect-[452/366] w-full rounded-lg object-cover"
        />
      </div>
    </article>
  );
}
