export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 py-10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} foliodeck.pro</p>
        <p>Selected work, updated regularly.</p>
      </div>
    </footer>
  );
}
