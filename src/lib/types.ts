export type Curator = {
  slug: string;
  name: string;
  role: string;
  /** URL of the curator's real external portfolio site. */
  externalUrl: string;
  /** Screenshot preview of the external site (hotlinked from Tilda CDN for now). */
  previewImage: string;
};

/** A card's size within a row template — "big" renders at 2x the width and height of "small". */
export type CardSize = "small" | "big";
