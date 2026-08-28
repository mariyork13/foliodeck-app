import { cache } from "react";
import { sql } from "./client";

export const SUBMISSION_STATUSES = [
  "new",
  "review",
  "approved",
  "published",
  "rejected",
  "removed",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export type SubmissionInput = {
  name: string;
  email: string;
  contact: string;
  specialization: string;
  portfolioUrl: string;
  consentProcessing: boolean;
  consentDisclosure: boolean;
  consentIp: string | null;
  consentUserAgent: string | null;
};

export type Submission = {
  id: number;
  name: string;
  email: string;
  contact: string;
  specialization: string;
  portfolioUrl: string;
  consentProcessing: boolean;
  consentDisclosure: boolean;
  consentIp: string | null;
  consentUserAgent: string | null;
  consentAt: string;
  status: SubmissionStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

/** The subset that Consent to Public Disclosure §2 permits on any public surface. */
export type PublicSafeSubmission = Pick<Submission, "id" | "name" | "specialization" | "portfolioUrl">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Submission {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    contact: row.contact,
    specialization: row.specialization,
    portfolioUrl: row.portfolio_url,
    consentProcessing: row.consent_processing,
    consentDisclosure: row.consent_disclosure,
    consentIp: row.consent_ip,
    consentUserAgent: row.consent_user_agent,
    consentAt: row.consent_at,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPublicSafe(submission: Submission): PublicSafeSubmission {
  return {
    id: submission.id,
    name: submission.name,
    specialization: submission.specialization,
    portfolioUrl: submission.portfolioUrl,
  };
}

export async function createSubmission(input: SubmissionInput): Promise<number> {
  const rows = await sql`
    INSERT INTO portfolio_submissions
      (name, email, contact, specialization, portfolio_url,
       consent_processing, consent_disclosure, consent_ip, consent_user_agent)
    VALUES
      (${input.name}, ${input.email}, ${input.contact}, ${input.specialization}, ${input.portfolioUrl},
       ${input.consentProcessing}, ${input.consentDisclosure}, ${input.consentIp}, ${input.consentUserAgent})
    RETURNING id
  `;
  return rows[0].id as number;
}

async function getSubmissionsPageImpl(options: {
  status?: SubmissionStatus | null;
  page: number;
  pageSize: number;
}): Promise<{ items: Submission[]; total: number }> {
  const { status, page, pageSize } = options;
  const offset = (page - 1) * pageSize;

  const [rows, countRows] = status
    ? await Promise.all([
        sql`
          SELECT * FROM portfolio_submissions
          WHERE status = ${status}
          ORDER BY created_at DESC
          LIMIT ${pageSize} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*)::int AS count FROM portfolio_submissions WHERE status = ${status}`,
      ])
    : await Promise.all([
        sql`
          SELECT * FROM portfolio_submissions
          ORDER BY created_at DESC
          LIMIT ${pageSize} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*)::int AS count FROM portfolio_submissions`,
      ]);

  return { items: rows.map(mapRow), total: countRows[0].count as number };
}
export const getSubmissionsPage = cache(getSubmissionsPageImpl);

async function getSubmissionByIdImpl(id: number): Promise<Submission | null> {
  const rows = await sql`SELECT * FROM portfolio_submissions WHERE id = ${id}`;
  return rows.length > 0 ? mapRow(rows[0]) : null;
}
export const getSubmissionById = cache(getSubmissionByIdImpl);

export async function getSubmissionStatusCounts(): Promise<Record<string, number>> {
  const rows = await sql`SELECT status, COUNT(*)::int AS count FROM portfolio_submissions GROUP BY status`;
  const counts: Record<string, number> = {};
  for (const row of rows as { status: string; count: number }[]) {
    counts[row.status] = row.count;
  }
  return counts;
}

export async function updateSubmissionStatus(
  id: number,
  status: SubmissionStatus,
  adminNote: string | null,
): Promise<void> {
  await sql`
    UPDATE portfolio_submissions
    SET status = ${status}, admin_note = ${adminNote}, updated_at = now()
    WHERE id = ${id}
  `;
}
