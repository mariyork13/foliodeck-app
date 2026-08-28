import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#161618] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-medium hover:text-white/70">
            Портфолио
          </Link>
          <Link href="/admin/submissions" className="font-medium hover:text-white/70">
            Заявки
          </Link>
          <Link href="/admin/tags" className="font-medium hover:text-white/70">
            Теги
          </Link>
          <Link href="/designer" className="font-medium hover:text-white/70">
            Выпускники
          </Link>
          <Link href="/admin/taxonomy" className="font-medium hover:text-white/70">
            Справочник
          </Link>
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-white/60 hover:text-white">
            Log out
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
