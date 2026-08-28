import Link from "next/link";
import { PortfolioList } from "@/components/admin/portfolio-list";
import { getCuratorsPage } from "@/lib/db/curators";

const PAGE_SIZE = 50;

export default async function AdminCuratorsPage(props: PageProps<"/admin">) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const { items, total } = await getCuratorsPage({ query, page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-medium">Портфолио ({total})</h1>
        <Link
          href="/admin/curators/new"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          Добавить портфолио
        </Link>
      </div>

      <form className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Поиск по имени или slug…"
          className="w-full max-w-sm rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
        />
      </form>

      {query ? (
        <p className="mb-3 text-xs text-white/40">
          Перетаскивание доступно, когда не активен поиск. Кнопки «В начало» / «В конец» работают всегда.
        </p>
      ) : (
        <p className="mb-3 text-xs text-white/40">
          Перетащите строку за ручку, чтобы изменить порядок. Новые портфолио появляются вверху списка.
        </p>
      )}

      <PortfolioList items={items} startIndex={(page - 1) * PAGE_SIZE} reorderable={!query} />

      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Link
              key={pageNumber}
              href={`/admin?${new URLSearchParams({ q: query, page: String(pageNumber) })}`}
              className={pageNumber === page ? "text-white" : "hover:text-white"}
            >
              {pageNumber}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
