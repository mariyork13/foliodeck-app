import { companyLogoImages } from "@/lib/companyLogoImages";
import { companyLogos } from "@/lib/companyLogos";

export function CompanyLogo({ name, src }: { name: string; src?: string | null }) {
  // An admin-uploaded logo (from the tags table) wins; then the bundled image
  // map; then a simple-icons match; then a plain placeholder.
  const image = src || companyLogoImages[name];
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" className="h-5 w-5 shrink-0 rounded-[6px] object-cover" />
    );
  }

  const icon = companyLogos[name];
  if (!icon) {
    return <span className="h-5 w-5 shrink-0 rounded-[6px] bg-white/10" />;
  }

  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-white"
      style={{ color: `#${icon.hex}` }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d={icon.path} />
      </svg>
    </span>
  );
}
