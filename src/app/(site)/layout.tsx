import { CookieBanner } from "@/components/cookie-banner";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SubscribeBanner } from "@/components/subscribe-banner";
import { getCurators } from "@/lib/db/curators";
import { getDistinctGeoValues, getTagsByType } from "@/lib/db/tags";

// The header depends on live curator/tag data from Postgres on every page in
// this group, so none of them can be snapshotted at build time.
export const dynamic = "force-dynamic";

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
  };

  return (
    <>
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
    </>
  );
}
