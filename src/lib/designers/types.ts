import type { TaxonomyCategory } from "./constants";

export type DesignerProgram = { program: string; cohort: string; year: number };

export type DesignerLink = { type: string; url: string };

/** Fully assembled designer as read from the DB and rendered in the UI. */
export type Designer = {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  coverImage: string | null;
  images: string[];
  grade: string;
  yearsOfExperience: number | null;
  openToWork: boolean;
  taxonomy: Record<TaxonomyCategory, string[]>;
  programs: DesignerProgram[];
  links: DesignerLink[];
};

/** Shape accepted by createDesigner / updateDesigner. */
export type DesignerInput = {
  slug: string;
  firstName: string;
  lastName: string;
  coverImage: string | null;
  images: string[];
  grade: string;
  yearsOfExperience: number | null;
  openToWork: boolean;
  taxonomyIds: number[];
  programs: DesignerProgram[];
  links: DesignerLink[];
};

export function emptyTaxonomy(): Record<TaxonomyCategory, string[]> {
  return {
    platform: [],
    business_model: [],
    industry: [],
    interface_type: [],
    skill: [],
    company_type: [],
  };
}
