"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/designers/image-upload-field";

/** Manual card cover, used when the auto site preview is broken. Submits as `coverImage`. */
export function CoverImageField({ defaultValue }: { defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">
        Обложка (если превью с сайта не грузится)
      </label>
      <p className="mb-2 text-xs text-white/40">
        Заменяет превью на карточке в галерее. Можно оставить пустым, если превью работает.
      </p>
      <ImageUploadField
        name="coverImage"
        value={value}
        onChange={setValue}
        onRemove={() => setValue("")}
      />
    </div>
  );
}
