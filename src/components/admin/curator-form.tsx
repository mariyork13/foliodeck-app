import type { CuratorRecord } from "@/lib/db/curators";
import type { Tag } from "@/lib/db/tags";
import { TagPicker } from "./tag-picker";

const inputClass = "w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40";
const labelClass = "mb-2 block text-sm font-medium text-white/80";

export function CuratorForm({
  action,
  curator,
  tags,
  geoOptions,
}: {
  action: (formData: FormData) => void | Promise<void>;
  curator?: CuratorRecord;
  tags: Record<"specialization" | "company" | "collection", Tag[]>;
  geoOptions: string[];
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
      <div>
        <label className={labelClass} htmlFor="name">
          Name
        </label>
        <input id="name" name="name" defaultValue={curator?.name} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="slug">
          Slug (used in the URL)
        </label>
        <input id="slug" name="slug" defaultValue={curator?.slug} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="role">
          Role
        </label>
        <input id="role" name="role" defaultValue={curator?.role} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="externalUrl">
          Portfolio URL
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
          Preview image URL
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

      <div>
        <label className={labelClass} htmlFor="geo">
          Geography
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
        label="Direction"
        options={tags.specialization}
        defaultSelectedIds={selectedIds("specialization")}
      />
      <TagPicker
        tagType="company"
        fieldName="companyIds"
        label="Company"
        options={tags.company}
        defaultSelectedIds={selectedIds("company")}
      />
      <TagPicker
        tagType="collection"
        fieldName="collectionIds"
        label="Collections"
        options={tags.collection}
        defaultSelectedIds={selectedIds("collection")}
      />

      <div>
        <label className={labelClass} htmlFor="notes">
          Portfolio notes
        </label>
        <textarea id="notes" name="notes" defaultValue={curator?.notes} rows={6} className={inputClass} />
      </div>

      <button type="submit" className="self-start rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">
        Save
      </button>
    </form>
  );
}
