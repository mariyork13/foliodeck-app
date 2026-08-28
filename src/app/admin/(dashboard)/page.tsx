import Link from "next/link";
import { deleteCuratorAction, reorderCuratorAction } from "@/lib/actions/curators";
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
        <h1 className="text-xl font-medium">Curators ({total})</h1>
        <Link
          href="/admin/curators/new"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          Add curator
        </Link>
      </div>

      <form className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name or slug..."
          className="w-full max-w-sm rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
        />
      </form>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50">
            <th className="w-20 py-2 font-normal">Position</th>
            <th className="py-2 font-normal">Name</th>
            <th className="py-2 font-normal">Role</th>
            <th className="py-2 font-normal">Slug</th>
            <th className="w-32 py-2 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((curator, index) => (
            <tr key={curator.id} className="border-b border-white/5">
              <td className="py-2">
                <form action={reorderCuratorAction.bind(null, curator.id)} className="flex items-center gap-1">
                  <input
                    type="number"
                    name="position"
                    defaultValue={(page - 1) * PAGE_SIZE + index + 1}
                    min={1}
                    className="w-16 rounded bg-white/10 px-2 py-1 text-white outline-none"
                  />
                  <button type="submit" className="text-white/50 hover:text-white">
                    Go
                  </button>
                </form>
              </td>
              <td className="py-2">{curator.name}</td>
              <td className="py-2 text-white/60">{curator.role}</td>
              <td className="py-2 text-white/40">{curator.slug}</td>
              <td className="py-2 text-right">
                <Link href={`/admin/curators/${curator.id}/edit`} className="mr-3 text-white/70 hover:text-white">
                  Edit
                </Link>
                <form action={deleteCuratorAction.bind(null, curator.id)} className="inline">
                  <button type="submit" className="text-red-400/80 hover:text-red-400">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
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
