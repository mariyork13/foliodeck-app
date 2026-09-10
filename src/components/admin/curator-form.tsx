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
  roleOptions,
  fromSubmissionId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  /** A full record when editing, or a partial prefill when creating from a submission. */
  curator?: Partial<CuratorRecord>;
  tags: Record<"specialization" | "company" | "collection" | "industry", Tag[]>;
  geoOptions: string[];
  /** Existing roles for the autocomplete list. */
  roleOptions: string[];
  /** When set, saving also marks the source portfolio submission as published. */
  fromSubmissionId?: number;
}) {
  const selectedIds = (type: "specialization" | "company" | "collection" | "industry") => {
    const names = new Set(
      type === "specialization"
        ? curator?.specializations
        : type === "company"
          ? curator?.companies
          : type === "collection"
            ? curator?.collections
            : curator?.industries,
    );
    return tags[type].filter((tag) => names.has(tag.name)).map((tag) => tag.id);
  };

  return (
    <form action={action} className="flex flex-col gap-5">
      {fromSubmissionId != null && (
        <input type="hidden" name="fromSubmission" value={fromSubmissionId} />
      )}
      {/* Slug is derived from the name on the server. Kept as a hidden field so
          editing an existing curator preserves its current page address. */}
      <input type="hidden" name="slug" defaultValue={curator?.slug ?? ""} />

      <div>
        <label className={labelClass} htmlFor="name">
          Имя
        </label>
        <input id="name" name="name" defaultValue={curator?.name} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="role">
          Роль
        </label>
        <input
          id="role"
          name="role"
          list="role-options"
          defaultValue={curator?.role}
          required
          autoComplete="off"
          className={inputClass}
        />
        <datalist id="role-options">
          {roleOptions.map((role) => (
            <option key={role} value={role} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-white/40">
          Выберите из списка или впишите новую.
        </p>
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

      {/* The old auto-screenshot URL. Preserved on edit (700 existing curators
          use it for their card thumbnail); left empty for new ones, which use
          the uploaded card image below. */}
      <input type="hidden" name="previewImage" defaultValue={curator?.previewImage ?? ""} />

      <CoverImageField defaultValue={curator?.coverImage} />

      <label className="flex items-start gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          name="notEmbeddable"
          defaultChecked={curator?.embeddable === false}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/10 accent-white"
        />
        <span>
          Сайт не открывается во встроенном виде — показывать картинку карточки
          на странице портфолио (для Тильды и подобных).
        </span>
      </label>

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
      <TagPicker
        tagType="industry"
        fieldName="industryIds"
        label="Индустрия"
        options={tags.industry}
        defaultSelectedIds={selectedIds("industry")}
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
