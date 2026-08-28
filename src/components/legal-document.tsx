"use client";

import { Fragment, type ReactNode } from "react";
import { useLanguage } from "@/lib/language-context";

type LegalText = { en: string; ru: string };

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

/** Renders the small subset of Markdown the legal texts use: **bold** and [text](url). */
function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE).filter((part) => part !== "");
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-medium text-white/90">{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const external = /^https?:\/\//.test(href);
      return (
        <a
          key={i}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="underline hover:text-white/80"
        >
          {label}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

type Block =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "p"; text: string };

/** Line-based parse. Every source block is a single line; bullets may be blank-line separated. */
function parseBlocks(source: string): Block[] {
  const lines = source.split("\n").map((l) => l.trim());
  const blocks: Block[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "") continue;

    if (line.startsWith("# ")) {
      blocks.push({ kind: "h1", text: line.slice(2) });
    } else if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", text: line.slice(3) });
    } else if (line.startsWith("• ") || line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const candidate = lines[i];
        if (candidate === "") {
          i++;
          continue;
        }
        if (candidate.startsWith("• ") || candidate.startsWith("- ")) {
          items.push(candidate.slice(2));
          i++;
        } else {
          break;
        }
      }
      i--;
      blocks.push({ kind: "ul", items });
    } else {
      blocks.push({ kind: "p", text: line });
    }
  }

  return blocks;
}

export function LegalDocument({ en, ru }: LegalText) {
  const { language, setLanguage } = useLanguage();
  const blocks = parseBlocks(language === "ru" ? ru : en);

  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-4 sm:pt-16">
      <div className="mb-8 flex items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={language === "en" ? "font-medium text-white/90" : "text-white/40 hover:text-white/70"}
        >
          English
        </button>
        <span className="text-white/20">/</span>
        <button
          type="button"
          onClick={() => setLanguage("ru")}
          className={language === "ru" ? "font-medium text-white/90" : "text-white/40 hover:text-white/70"}
        >
          Русский
        </button>
      </div>

      <div className="space-y-4 text-base leading-relaxed text-white/60">
        {blocks.map((block, i) => {
          switch (block.kind) {
            case "h1":
              return (
                <h1 key={i} className="mb-6 text-[22px] font-medium text-white/90">
                  {block.text}
                </h1>
              );
            case "h2":
              return (
                <h2 key={i} className="mb-3 mt-10 text-[18px] font-medium text-white/90">
                  {renderInline(block.text)}
                </h2>
              );
            case "ul":
              return (
                <ul key={i} className="list-disc space-y-2 pl-5">
                  {block.items.map((item, j) => (
                    <li key={j}>{renderInline(item)}</li>
                  ))}
                </ul>
              );
            case "p":
              return <p key={i}>{renderInline(block.text)}</p>;
          }
        })}
      </div>
    </article>
  );
}
