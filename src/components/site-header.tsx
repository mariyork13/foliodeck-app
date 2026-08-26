import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#161618]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-6">
        <Link href="/" className="shrink-0 text-base font-medium tracking-tight text-white/90">
          Foliodeck
        </Link>

        <nav className="hidden shrink-0 items-center gap-5 text-sm text-white/50 sm:flex">
          <Link href="/about" className="transition-colors hover:text-white/90">
            Проект
          </Link>
          <Link href="/founder" className="transition-colors hover:text-white/90">
            Куратор
          </Link>
        </nav>

        <div className="hidden flex-1 md:block">
          <input
            type="text"
            placeholder="Поиск"
            className="w-full max-w-xs rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 placeholder:text-white/30 focus:border-white/20 focus:outline-none"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 text-sm">
          <button className="rounded-full px-3 py-1.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90">
            Фильтры
          </button>
          <button className="hidden rounded-full px-3 py-1.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90 sm:inline-block">
            Избранное
          </button>
          <button className="rounded-full bg-white px-4 py-1.5 font-medium text-black transition-colors hover:bg-white/90">
            Отправить
          </button>
        </div>
      </div>
    </header>
  );
}
