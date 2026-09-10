import { CookieBanner } from "@/components/cookie-banner";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SubscribeBanner } from "@/components/subscribe-banner";
import { YandexMetrica } from "@/components/yandex-metrica";
import { ConsentProvider } from "@/lib/consent-context";
import { getCurators } from "@/lib/db/curators";
import { getDistinctGeoValues, getTagsByType } from "@/lib/db/tags";

// ISR for the whole (site) group. The header's curator/tag data regenerates at
// most every 2 minutes; admin edits call revalidatePath("/", "layout").
export const revalidate = 120;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [curators, specializations, companies, collections, geo] = await Promise.all([
    getCurators(),
    getTagsByType("specialization"),
    getTagsByType("company"),
    getTagsByType("collection"),
    getDistinctGeoValues(),
  ]);
  const filterOptions = {
    specializations: specializations.map((tag) => tag.name),
    companies: companies.map((tag) => tag.name),
    collections: collections.map((tag) => tag.name),
    geo,
    companyLogos: Object.fromEntries(
      companies.flatMap((tag) => (tag.logo ? [[tag.name, tag.logo] as const] : [])),
    ),
  };

  return (
    <ConsentProvider>
      <SiteHeader curators={curators} filterOptions={filterOptions} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <div
        id="bottom-banner-stack"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex flex-col-reverse items-center gap-3 px-4 sm:px-0"
      >
        <CookieBanner />
        <SubscribeBanner />
      </div>
      <ScrollToTopButton />
      <YandexMetrica />
    </ConsentProvider>
  );
}
