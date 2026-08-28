"use client";

import { useRef, useState } from "react";

const MAX_EDGE = 2400; // downscale longest edge to this before upload
const REENCODE_ABOVE = 3 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

type Prepared = { blob: Blob; type: string; name: string };

/** Downscale/re-encode big images client-side so they fit the upload limit. */
async function prepareImage(file: File): Promise<Prepared> {
  if (file.type === "image/gif") return { blob: file, type: file.type, name: file.name };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const heavy = file.size > REENCODE_ABOVE || file.type === "image/png";
    if (scale === 1 && !heavy) {
      bitmap.close();
      return { blob: file, type: file.type, name: file.name };
    }
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: file, type: file.type, name: file.name };
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const out = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.9),
    );
    if (!out) return { blob: file, type: file.type, name: file.name };
    const base = file.name.replace(/\.[^.]+$/, "");
    return { blob: out, type: "image/webp", name: `${base}.webp` };
  } catch {
    return { blob: file, type: file.type, name: file.name };
  }
}

export function ImageUploadField({
  name,
  value,
  onChange,
  onRemove,
}: {
  /** Hidden input name submitted with the form (e.g. "coverImage" or "images"). */
  name: string;
  value: string;
  onChange: (value: string) => void;
  /** If given, the "remove" control clears the value and calls this. */
  onRemove?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Нужен файл изображения.");
      return;
    }
    setBusy(true);
    try {
      const prepared = await prepareImage(file);
      const res = await fetch("/api/blob-upload", {
        method: "POST",
        headers: { "content-type": prepared.type, "x-filename": prepared.name },
        body: prepared.blob,
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Не удалось загрузить.");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={value} />

      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-50"
            >
              {busy ? "Загрузка…" : "Заменить"}
            </button>
            <button
              type="button"
              onClick={() => (onRemove ? onRemove() : onChange(""))}
              className="rounded-lg px-3 py-1.5 text-sm text-white/50 hover:text-red-400"
            >
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={`flex flex-wrap items-center gap-2 rounded-lg border border-dashed px-3 py-3 transition-colors ${
            dragOver ? "border-white/40 bg-white/[0.04]" : "border-white/15"
          }`}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-50"
          >
            {busy ? "Загрузка…" : "Загрузить файл"}
          </button>
          <span className="text-sm text-white/30">перетащите или</span>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="вставьте ссылку https://…"
            className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/40"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg px-2 py-1.5 text-sm text-white/40 hover:text-red-400"
              aria-label="Удалить строку"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-1 text-sm text-red-400/90">{error}</p>}
    </div>
  );
}
