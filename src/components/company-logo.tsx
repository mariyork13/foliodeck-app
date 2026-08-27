import { companyLogos } from "@/lib/companyLogos";

export function CompanyLogo({ name }: { name: string }) {
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
