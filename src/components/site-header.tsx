import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          foliodeck<span className="text-zinc-400">.</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50">
            Work
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-black/10 px-4 py-1.5 transition-colors hover:border-black/30 hover:text-zinc-950 dark:border-white/15 dark:hover:border-white/40 dark:hover:text-zinc-50"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
