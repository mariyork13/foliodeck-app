"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/designers/image-upload-field";

/** The card image shown in the gallery. Submits as `coverImage`. */
export function CoverImageField({ defaultValue }: { defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">
        Картинка карточки
      </label>
      <p className="mb-2 text-xs text-white/40">
        Загрузите файл или вставьте ссылку — это картинка карточки в галерее.
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
