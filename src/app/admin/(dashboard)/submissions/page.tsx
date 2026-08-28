import Link from "next/link";
import { getSubmissionsPage, getSubmissionStatusCounts, SUBMISSION_STATUSES } from "@/lib/db/submissions";
import { STATUS_LABELS } from "@/lib/submissions/status-labels";

const PAGE_SIZE = 50;

function isStatus(value: string): value is (typeof SUBMISSION_STATUSES)[number] {
  return (SUBMISSION_STATUSES as readonly string[]).includes(value);
}

export default async function AdminSubmissionsPage(props: PageProps<"/admin/submissions">) {
  const searchParams = await props.searchParams;
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : "";
  const status = isStatus(statusParam) ? statusParam : null;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ items, total }, counts] = await Promise.all([
    getSubmissionsPage({ status, page, pageSize: PAGE_SIZE }),
    getSubmissionStatusCounts(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const tab = (href: string, label: string, count: number, active: boolean) => (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 ${active ? "bg-white text-black" : "bg-white/10 text-white/70 hover:text-white"}`}
    >
      {label} ({count})
    </Link>
  );

  return (
    <div>
      <h1 className="mb-6 text-xl font-medium">Заявки на портфолио ({allCount})</h1>

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {tab("/admin/submissions", "Все", allCount, status === null)}
        {SUBMISSION_STATUSES.map((s) =>
          tab(`/admin/submissions?status=${s}`, STATUS_LABELS[s], counts[s] ?? 0, status === s),
        )}
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50">
            <th className="py-2 font-normal">Дата</th>
            <th className="py-2 font-normal">Имя</th>
            <th className="py-2 font-normal">Специализация</th>
            <th className="py-2 font-normal">Портфолио</th>
            <th className="py-2 font-normal">Статус</th>
            <th className="w-24 py-2 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-b border-white/5">
              <td className="py-2 text-white/60">{new Date(s.createdAt).toLocaleDateString("ru-RU")}</td>
              <td className="py-2">{s.name}</td>
              <td className="py-2 text-white/60">{s.specialization}</td>
              <td className="py-2 text-white/40">
                <a
                  href={s.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  {s.portfolioUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </td>
              <td className="py-2 text-white/60">{STATUS_LABELS[s.status]}</td>
              <td className="py-2 text-right">
                <Link href={`/admin/submissions/${s.id}`} className="text-white/70 hover:text-white">
                  Открыть
                </Link>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-white/40">
                Заявок нет
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
            const params = new URLSearchParams();
            if (status) params.set("status", status);
            params.set("page", String(pageNumber));
            return (
              <Link
                key={pageNumber}
                href={`/admin/submissions?${params}`}
                className={pageNumber === page ? "text-white" : "hover:text-white"}
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
