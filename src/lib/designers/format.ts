import { LINK_LABELS } from "./constants";
import type { Designer } from "./types";

function pluralYears(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} года`;
  return `${n} лет`;
}

/**
 * Human-readable, message-ready summary of a designer. No technical field names,
 * no empty sections — a missing link simply doesn't produce a line. Meant to be
 * pasted as one message into Telegram / Slack / WhatsApp / email.
 */
export function formatDesignerText(d: Designer): string {
  const lines: string[] = [];
  lines.push(`${d.firstName} ${d.lastName}`.trim());

  const headline = [
    d.grade,
    d.yearsOfExperience != null ? `${pluralYears(d.yearsOfExperience)} опыта` : null,
  ]
    .filter(Boolean)
    .join(", ");
  if (headline) lines.push(headline);
  if (d.openToWork) lines.push("Ищет работу");

  const t = d.taxonomy;
  if (t.industry.length) lines.push(t.industry.join(", "));
  if (t.platform.length) lines.push(t.platform.join(", "));
  if (t.interface_type.length) lines.push(t.interface_type.join(", "));
  if (t.skill.length) lines.push(`Сильные стороны: ${t.skill.join(", ")}`);
  if (t.business_model.length) lines.push(`Бизнес-модель: ${t.business_model.join(", ")}`);
  if (t.company_type.length) lines.push(`Тип компании: ${t.company_type.join(", ")}`);

  if (d.programs.length) {
    lines.push("");
    lines.push("Обучение:");
    for (const p of d.programs) lines.push(`${p.program} · поток ${p.cohort} · ${p.year}`);
  }

  const links = d.links.filter((l) => l.url.trim());
  if (links.length) {
    lines.push("");
    for (const l of links) lines.push(`${LINK_LABELS[l.type] ?? l.type}: ${l.url}`);
  }

  return lines.join("\n");
}
