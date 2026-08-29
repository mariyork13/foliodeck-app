"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@/components/x-icon";
import type { CuratorRecord } from "@/lib/db/curators";
import type { Tag } from "@/lib/db/tags";
import { CuratorForm } from "./curator-form";

export function CuratorFormModal({
  title,
  action,
  curator,
  tags,
  geoOptions,
  fromSubmissionId,
  note,
  intercepted = false,
}: {
  title: string;
  /** Server action, already bound (create as-is, update via .bind(null, id)). */
  action: (formData: FormData) => Promise<void>;
  /** Full record when editing, partial prefill when creating, undefined otherwise. */
  curator?: Partial<CuratorRecord>;
  tags: Record<"specialization" | "company" | "collection", Tag[]>;
  geoOptions: string[];
  fromSubmissionId?: number;
  note?: ReactNode;
  /** True only when opened by the intercepting route (a soft nav from a list). */
  intercepted?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Intercepted: pop back to wherever it was opened from, keeping that page's
  // scroll position. Direct visit / refresh: there's nothing to go back to.
  const close = () => {
    if (intercepted) router.back();
    else router.push("/admin", { scroll: false });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(formData: FormData) {
    setError(null);
    try {
      await action(formData);
    } catch {
      setError("Не удалось сохранить. Проверьте адрес страницы — возможно, он уже занят.");
      return;
    }
    router.refresh();
    close();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm sm:p-6">
      <div className="fixed inset-0" onClick={close} aria-hidden />

      <div className="relative z-10 flex h-[100dvh] w-full max-w-[680px] flex-col overflow-hidden bg-[#161618] shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:border sm:border-white/10">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-medium text-white">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {note && <p className="mb-5 text-sm text-white/50">{note}</p>}
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <CuratorForm
            action={save}
            curator={curator}
            tags={tags}
            geoOptions={geoOptions}
            fromSubmissionId={fromSubmissionId}
          />
        </div>
      </div>
    </div>
  );
}
