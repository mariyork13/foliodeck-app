import Link from "next/link";
import { PortfolioList } from "@/components/admin/portfolio-list";
import { SearchIcon } from "@/components/icons";
import { getCuratorsPage } from "@/lib/db/curators";

const PAGE_SIZE = 50;

export default async function AdminCuratorsPage(props: PageProps<"/admin">) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const showAll = searchParams.view === "all";
  const page = showAll ? 1 : Math.max(1, Number(searchParams.page) || 1);

  const { items, total } = await getCuratorsPage({
    query,
    page,
    pageSize: showAll ? 100_000 : PAGE_SIZE,
  });
  const totalPages = showAll ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));

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

      <form className="mb-4">
        <div className="relative rounded-lg border border-white/[0.04] bg-[#26262B]/70 backdrop-blur-[74px]">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Поиск по имени или адресу…"
            className="w-full rounded-lg bg-transparent py-[9px] pl-8 pr-3 text-[13px] text-white placeholder:text-white/50 focus:outline-none"
          />
          {showAll && <input type="hidden" name="view" value="all" />}
        </div>
      </form>

      <div className="mb-4 flex items-center gap-3 text-xs">
        <Link
          href={`/admin?${new URLSearchParams(query ? { q: query } : {})}`}
          className={showAll ? "text-white/40 hover:text-white" : "font-medium text-white"}
        >
          По страницам
        </Link>
        <Link
          href={`/admin?${new URLSearchParams(query ? { q: query, view: "all" } : { view: "all" })}`}
          className={showAll ? "font-medium text-white" : "text-white/40 hover:text-white"}
        >
          Все списком ({total})
        </Link>
      </div>

      <PortfolioList
        items={items}
        startIndex={showAll ? 0 : (page - 1) * PAGE_SIZE}
        reorderable={!query}
      />

      {!showAll && totalPages > 1 && (
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
