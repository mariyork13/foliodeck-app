export type Curator = {
  slug: string;
  name: string;
  role: string;
  /** URL of the curator's real external portfolio site. */
  externalUrl: string;
  /** Screenshot preview of the external site (hotlinked from Tilda CDN for now). */
  previewImage: string;
};
