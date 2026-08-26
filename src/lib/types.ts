export type Category = "Branding" | "Web Design" | "UI/UX" | "Photography" | "Illustration";

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: Category;
  year: number;
  /** Tailwind gradient classes used as a placeholder cover until real images are uploaded via the admin. */
  gradient: string;
  description: string;
  /** Number of placeholder tiles to render on the project detail page. */
  imageCount: number;
};
