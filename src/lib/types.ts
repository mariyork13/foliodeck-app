export type Curator = {
  slug: string;
  name: string;
  role: string;
  /** URL of the curator's real external portfolio site. */
  externalUrl: string;
  /** Screenshot preview of the external site (hotlinked from Tilda CDN for now). */
  previewImage: string;
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
