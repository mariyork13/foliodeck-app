"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/designers/image-upload-field";

/** Per-company logo, shown next to the company in the site's filter panel. */
export function TagLogoField({
  tagId,
  defaultValue,
  action,
}: {
  tagId: number;
  defaultValue: string | null;
  /** setTagLogoAction, already .bind(null, tagId) is done here. */
  action: (tagId: number, formData: FormData) => Promise<void>;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const dirty = value !== (defaultValue ?? "");

  return (
    <form action={action.bind(null, tagId)} className="flex items-center gap-2">
      <div className="w-60">
        <ImageUploadField
          name="logo"
          value={value}
          onChange={setValue}
          onRemove={() => setValue("")}
        />
      </div>
      {dirty && (
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
        >
          Сохранить логотип
        </button>
      )}
    </form>
  );
}
