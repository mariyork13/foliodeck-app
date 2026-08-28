import type { SubmissionStatus } from "@/lib/db/submissions";

// Admin UI stays Russian (spec §14); DB values stay technical.
export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "Новые",
  review: "На рассмотрении",
  approved: "Одобрены",
  published: "Опубликованы",
  rejected: "Отклонены",
  removed: "Удалены",
};
