"use client";

import { useState } from "react";
import {
  CATEGORY_LABELS,
  GRADES,
  LINK_LABELS,
  LINK_TYPES,
  PROGRAMS,
  TAXONOMY_CATEGORIES,
  type TaxonomyCategory,
} from "@/lib/designers/constants";
import { designerSlug } from "@/lib/designers/slug";
import type { Designer } from "@/lib/designers/types";
import type { TaxonomyTerm } from "@/lib/db/taxonomy";
import { ImageUploadField } from "./image-upload-field";
import { TaxonomyPicker } from "./taxonomy-picker";

const inputClass =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40";
const labelClass = "mb-2 block text-sm font-medium text-white/80";

type ProgramRow = { program: string; cohort: string; year: string };
type LinkRow = { type: string; url: string };

export function DesignerForm({
  action,
  designer,
  taxonomy,
}: {
  action: (formData: FormData) => void | Promise<void>;
  designer?: Designer;
  taxonomy: Record<TaxonomyCategory, TaxonomyTerm[]>;
}) {
  const [firstName, setFirstName] = useState(designer?.firstName ?? "");
  const [lastName, setLastName] = useState(designer?.lastName ?? "");
  // null → slug is auto-derived from the name; a string → the admin typed it.
  const [slugOverride, setSlugOverride] = useState<string | null>(designer?.slug ?? null);
  const slug = slugOverride ?? designerSlug(firstName, lastName);

  const [coverImage, setCoverImage] = useState(designer?.coverImage ?? "");
  const [images, setImages] = useState<string[]>(designer?.images ?? []);
  const [programs, setPrograms] = useState<ProgramRow[]>(
    designer?.programs.map((p) => ({
      program: p.program,
      cohort: p.cohort,
      year: String(p.year),
    })) ?? [],
  );
  const [links, setLinks] = useState<LinkRow[]>(
    designer?.links.map((l) => ({ type: l.type, url: l.url })) ?? [],
  );

  const selectedIds = (category: TaxonomyCategory): number[] => {
    const names = new Set(designer?.taxonomy[category] ?? []);
    return taxonomy[category].filter((t) => names.has(t.name)).map((t) => t.id);
  };

  return (
    <form action={action} autoComplete="off" className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="firstName">
            Имя
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">
            Фамилия
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="slug">
          Slug (в адресе профиля)
        </label>
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => setSlugOverride(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="grade">
            Грейд
          </label>
          <select
            id="grade"
            name="grade"
            required
            defaultValue={designer?.grade ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Выберите грейд
            </option>
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="yearsOfExperience">
            Лет опыта
          </label>
          <input
            id="yearsOfExperience"
            name="yearsOfExperience"
            type="number"
            min={0}
            max={60}
            defaultValue={designer?.yearsOfExperience ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium text-white/80">
        <input
          type="checkbox"
          name="openToWork"
          // New profile → always off; edit → reflects the saved value.
          defaultChecked={Boolean(designer?.openToWork)}
          autoComplete="off"
          className="h-4 w-4 accent-green-400"
        />
        Ищет работу
      </label>

      <div>
        <label className={labelClass}>Обложка</label>
        <ImageUploadField name="coverImage" value={coverImage} onChange={setCoverImage} />
      </div>

      <RepeatableList
        label="Дополнительные изображения"
        addLabel="+ изображение"
        rows={images}
        onChange={setImages}
        empty=""
        render={(value, set) => (
          <ImageUploadField name="images" value={value} onChange={set} />
        )}
      />

      {TAXONOMY_CATEGORIES.map((category) => (
        <TaxonomyPicker
          key={category}
          category={category}
          label={CATEGORY_LABELS[category]}
          options={taxonomy[category].map((t) => ({ id: t.id, name: t.name }))}
          defaultSelectedIds={selectedIds(category)}
        />
      ))}

      <RepeatableList
        label="Программы обучения"
        addLabel="+ программа"
        rows={programs}
        onChange={setPrograms}
        empty={{ program: PROGRAMS[0], cohort: "", year: "" }}
        render={(value, set) => (
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              name="programProgram"
              list="program-options"
              value={value.program}
              onChange={(e) => set({ ...value, program: e.target.value })}
              placeholder="Программа"
              className={inputClass}
            />
            <input
              name="programCohort"
              value={value.cohort}
              onChange={(e) => set({ ...value, cohort: e.target.value })}
              placeholder="Поток"
              className={inputClass}
            />
            <input
              name="programYear"
              type="number"
              min={2000}
              max={2100}
              value={value.year}
              onChange={(e) => set({ ...value, year: e.target.value })}
              placeholder="Год"
              className={inputClass}
            />
          </div>
        )}
      />
      <datalist id="program-options">
        {PROGRAMS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      <RepeatableList
        label="Ссылки"
        addLabel="+ ссылка"
        rows={links}
        onChange={setLinks}
        empty={{ type: LINK_TYPES[0], url: "" }}
        render={(value, set) => (
          <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
            <select
              name="linkType"
              value={value.type}
              onChange={(e) => set({ ...value, type: e.target.value })}
              className={inputClass}
            >
              {LINK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {LINK_LABELS[type]}
                </option>
              ))}
            </select>
            <input
              name="linkUrl"
              type="url"
              value={value.url}
              onChange={(e) => set({ ...value, url: e.target.value })}
              placeholder="https://…"
              className={inputClass}
            />
          </div>
        )}
      />

      <button
        type="submit"
        className="self-start rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
      >
        Сохранить
      </button>
    </form>
  );
}

function RepeatableList<T>({
  label,
  addLabel,
  rows,
  onChange,
  empty,
  render,
}: {
  label: string;
  addLabel: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  empty: T;
  render: (value: T, set: (next: T) => void) => React.ReactNode;
}) {
  const clone = (): T =>
    typeof empty === "object" && empty !== null ? ({ ...empty } as T) : empty;

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              {render(row, (next) => onChange(rows.map((r, j) => (j === i ? next : r))))}
            </div>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              className="mt-1 shrink-0 rounded-lg px-2 py-1 text-sm text-white/40 hover:text-red-400"
              aria-label="Удалить строку"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, clone()])}
        className="mt-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
      >
        {addLabel}
      </button>
    </div>
  );
}
