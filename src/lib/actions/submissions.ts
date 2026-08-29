"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  createSubmission,
  SUBMISSION_STATUSES,
  updateSubmissionStatus,
  type SubmissionStatus,
} from "@/lib/db/submissions";
import { validateSubmission, type FieldErrors } from "@/lib/submissions/validation";

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: "validation"; fields: FieldErrors }
  | { ok: false; error: "server" };

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

/** Best-effort Telegram ping to the Operator's private chat. Never blocks the submission. */
async function notifyTelegram(summary: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.info("[submissions] Telegram not configured — skipping notification");
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: summary, disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error("[submissions] Telegram notification failed", err);
  }
}

export async function submitPortfolioAction(
  _prev: SubmitResult | null,
  formData: FormData,
): Promise<SubmitResult> {
  const values = {
    name: field(formData, "name"),
    email: field(formData, "email"),
    contact: field(formData, "contact"),
    specialization: field(formData, "specialization"),
    portfolioUrl: field(formData, "portfolioUrl"),
    consentProcessing: formData.get("consentProcessing") === "on",
    consentDisclosure: formData.get("consentDisclosure") === "on",
  };

  const fields = validateSubmission(values);
  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "validation", fields };
  }

  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const consentIp = forwardedFor ? forwardedFor.split(",")[0].trim() : null;
    const consentUserAgent = headerList.get("user-agent");

    const id = await createSubmission({
      name: values.name,
      email: values.email,
      contact: values.contact,
      specialization: values.specialization,
      portfolioUrl: values.portfolioUrl,
      consentProcessing: values.consentProcessing,
      consentDisclosure: values.consentDisclosure,
      consentIp,
      consentUserAgent,
    });

    await notifyTelegram(
      [
        "New portfolio submission",
        `#${id} · ${values.name}`,
        `Specialization: ${values.specialization}`,
        `Portfolio: ${values.portfolioUrl}`,
        `Email: ${values.email}`,
        `Contact: ${values.contact}`,
      ].join("\n"),
    );

    revalidatePath("/admin/submissions");
    return { ok: true };
  } catch (err) {
    console.error("[submissions] createSubmission failed", err);
    return { ok: false, error: "server" };
  }
}

function isStatus(value: string): value is SubmissionStatus {
  return (SUBMISSION_STATUSES as readonly string[]).includes(value);
}

export async function setSubmissionStatusAction(id: number, formData: FormData): Promise<void> {
  await requireAdminSession();

  const status = String(formData.get("status") ?? "");
  if (!isStatus(status)) return;

  const noteRaw = String(formData.get("adminNote") ?? "").trim();
  await updateSubmissionStatus(id, status, noteRaw || null);

  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
}

/**
 * Quick one-click mark from the list, mirroring the ✓/✗ Telegram reactions:
 * ✓ = approved, ✗ = won't publish. "published" is set separately, only when the
 * portfolio is actually created from the submission. Leaves any admin note
 * untouched; clicking the mark a submission already has clears it back to "new".
 * `currentStatus` comes from the list row so no re-read is needed.
 */
export async function markSubmissionAction(
  id: number,
  mark: Extract<SubmissionStatus, "approved" | "rejected">,
  currentStatus: SubmissionStatus,
): Promise<void> {
  await requireAdminSession();

  // Don't let the quick ✓ downgrade an already-published submission.
  if (mark === "approved" && currentStatus === "published") return;

  const next = currentStatus === mark ? "new" : mark;
  await updateSubmissionStatus(id, next);

  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
}
