import type { CuratorRecord } from "@/lib/db/curators";
import { slugify } from "@/lib/designers/slug";

type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * Shared by the two entry points to "Добавить портфолио" (the intercepted modal
 * and the direct page): reads the optional prefill query (?name/role/url/from)
 * that the submissions screen passes when publishing a portfolio from a request.
 */
export function parseCuratorPrefill(sp: SearchParams): {
  prefill: Partial<CuratorRecord> | undefined;
  fromSubmissionId: number | undefined;
  note: string | undefined;
} {
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
  const name = str(sp.name);
  const fromId = Number(str(sp.from));
  const fromSubmission = Number.isInteger(fromId) && fromId > 0;

  return {
    prefill: name
      ? { name, slug: slugify(name), role: str(sp.role), externalUrl: str(sp.url) }
      : undefined,
    fromSubmissionId: fromSubmission ? fromId : undefined,
    note: fromSubmission
      ? `Данные подставлены из заявки #${fromId}. Добавьте обложку и сохраните — заявка отметится как «Опубликовано».`
      : undefined,
  };
}
