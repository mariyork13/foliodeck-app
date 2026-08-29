import Link from "next/link";
import { notFound } from "next/navigation";
import { setSubmissionStatusAction } from "@/lib/actions/submissions";
import { getSubmissionById, SUBMISSION_STATUSES } from "@/lib/db/submissions";
import { STATUS_LABELS } from "@/lib/submissions/status-labels";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-white/5 py-3 text-sm">
      <div className="text-white/40">{label}</div>
      <div className="text-white/80">{children}</div>
    </div>
  );
}

export default async function AdminSubmissionDetailPage(props: PageProps<"/admin/submissions/[id]">) {
  const { id } = await props.params;
  const submissionId = Number(id);
  if (!Number.isInteger(submissionId)) notFound();

  const submission = await getSubmissionById(submissionId);
  if (!submission) notFound();

  const fmt = (value: string) => new Date(value).toLocaleString("ru-RU");

  return (
    <div className="max-w-2xl">
      <Link href="/admin/submissions" className="text-sm text-white/50 hover:text-white">
        ← К списку заявок
      </Link>

      <div className="mb-6 mt-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-medium">
          Заявка #{submission.id} · {submission.name}
        </h1>
        <Link
          href={`/admin/curators/new?${new URLSearchParams({
            name: submission.name,
            role: submission.specialization,
            url: submission.portfolioUrl,
            from: String(submission.id),
          })}`}
          className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          Опубликовать
        </Link>
      </div>

      <div className="mb-8">
        <Row label="Имя">{submission.name}</Row>
        <Row label="Email">{submission.email}</Row>
        <Row label="Telegram / LinkedIn">{submission.contact}</Row>
        <Row label="Специализация">{submission.specialization}</Row>
        <Row label="Портфолио">
          <a
            href={submission.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            {submission.portfolioUrl}
          </a>
        </Row>
        <Row label="Отправлено">{fmt(submission.createdAt)}</Row>
      </div>

      <h2 className="mb-2 text-sm font-medium text-white/70">Согласия</h2>
      <div className="mb-8">
        <Row label="Обработка ПДн">{submission.consentProcessing ? "Да" : "Нет"}</Row>
        <Row label="Распространение ПДн">{submission.consentDisclosure ? "Да" : "Нет"}</Row>
        <Row label="Дата согласия">{fmt(submission.consentAt)}</Row>
        <Row label="IP">{submission.consentIp ?? "—"}</Row>
        <Row label="User Agent">
          <span className="break-all text-xs text-white/50">{submission.consentUserAgent ?? "—"}</span>
        </Row>
      </div>

      <h2 className="mb-3 text-sm font-medium text-white/70">Модерация</h2>
      <form action={setSubmissionStatusAction.bind(null, submission.id)} className="flex flex-col gap-3">
        <label className="text-sm text-white/60">
          Статус
          <select
            name="status"
            defaultValue={submission.status}
            className="mt-1 block w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none"
          >
            {SUBMISSION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]} ({s})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-white/60">
          Заметка
          <textarea
            name="adminNote"
            defaultValue={submission.adminNote ?? ""}
            rows={3}
            className="mt-1 block w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none"
          />
        </label>
        <button
          type="submit"
          className="self-start rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}
