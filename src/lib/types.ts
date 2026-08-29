export type Curator = {
  slug: string;
  name: string;
  role: string;
  /** URL of the curator's real external portfolio site. */
  externalUrl: string;
  /** Auto screenshot of the external site (often a dead Tilda link). */
  previewImage: string;
  /** Manual cover shown when the site can't be embedded in an iframe. */
  coverImage?: string | null;
  /** Whether the site can be shown in an <iframe> (null = not checked yet). */
  embeddable?: boolean | null;
  /** Legacy: full-page screenshots (feature removed, table kept). */
  images: string[];
  /** Matches specializationOptions in filterOptions.ts. */
  specializations: string[];
  /** Matches geoOptions in filterOptions.ts. */
  geo?: string;
  /** Matches companyOptions in filterOptions.ts. */
  companies?: string[];
  /** Matches collectionOptions in filterOptions.ts. */
  collections?: string[];
  /** Curator's own commentary on this portfolio, shown in the Notes dropdown on the detail page. */
  notes?: string;
};

/** DB-backed replacement for the old static filterOptions.ts constants. */
export type FilterOptions = {
  specializations: string[];
  companies: string[];
  collections: string[];
  geo: string[];
};
