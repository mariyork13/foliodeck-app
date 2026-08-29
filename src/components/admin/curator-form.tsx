import type { CuratorRecord } from "@/lib/db/curators";
import type { Tag } from "@/lib/db/tags";
import { CoverImageField } from "./cover-image-field";
import { FormSubmitButton } from "./form-submit-button";
import { TagPicker } from "./tag-picker";

const inputClass = "w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40";
const labelClass = "mb-2 block text-sm font-medium text-white/80";

export function CuratorForm({
  action,
  curator,
  tags,
  geoOptions,
  fromSubmissionId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  /** A full record when editing, or a partial prefill when creating from a submission. */
  curator?: Partial<CuratorRecord>;
  tags: Record<"specialization" | "company" | "collection", Tag[]>;
  geoOptions: string[];
  /** When set, saving also marks the source portfolio submission as published. */
  fromSubmissionId?: number;
}) {
  const selectedIds = (type: "specialization" | "company" | "collection") => {
    const names = new Set(
      type === "specialization"
        ? curator?.specializations
        : type === "company"
          ? curator?.companies
          : curator?.collections,
    );
    return tags[type].filter((tag) => names.has(tag.name)).map((tag) => tag.id);
  };

  return (
    <form action={action} className="flex flex-col gap-5">
      {fromSubmissionId != null && (
        <input type="hidden" name="fromSubmission" value={fromSubmissionId} />
      )}
      <div>
        <label className={labelClass} htmlFor="name">
          Имя
        </label>
        <input id="name" name="name" defaultValue={curator?.name} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="slug">
          Адрес страницы (в ссылке на сайте)
        </label>
        <input id="slug" name="slug" defaultValue={curator?.slug} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="role">
          Роль
        </label>
        <input id="role" name="role" defaultValue={curator?.role} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="externalUrl">
          Ссылка на портфолио
        </label>
        <input
          id="externalUrl"
          name="externalUrl"
          type="url"
          defaultValue={curator?.externalUrl}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="previewImage">
          Превью сайта (скриншот)
        </label>
        <input
          id="previewImage"
          name="previewImage"
          type="url"
          defaultValue={curator?.previewImage}
          required
          className={inputClass}
        />
      </div>

      <CoverImageField defaultValue={curator?.coverImage} />

      <div>
        <label className={labelClass} htmlFor="geo">
          География
        </label>
        <input id="geo" name="geo" list="geo-options" defaultValue={curator?.geo} className={inputClass} />
        <datalist id="geo-options">
          {geoOptions.map((geo) => (
            <option key={geo} value={geo} />
          ))}
        </datalist>
      </div>

      <TagPicker
        tagType="specialization"
        fieldName="specializationIds"
        label="Направление"
        options={tags.specialization}
        defaultSelectedIds={selectedIds("specialization")}
      />
      <TagPicker
        tagType="company"
        fieldName="companyIds"
        label="Компания"
        options={tags.company}
        defaultSelectedIds={selectedIds("company")}
      />
      <TagPicker
        tagType="collection"
        fieldName="collectionIds"
        label="Коллекции"
        options={tags.collection}
        defaultSelectedIds={selectedIds("collection")}
      />

      <div>
        <label className={labelClass} htmlFor="notes">
          Заметки о портфолио
        </label>
        <textarea id="notes" name="notes" defaultValue={curator?.notes} rows={6} className={inputClass} />
      </div>

      <FormSubmitButton>Сохранить</FormSubmitButton>
    </form>
  );
}
