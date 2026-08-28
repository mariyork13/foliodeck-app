import type { ReactNode } from "react";
import { DesignerFilterProvider } from "@/lib/designers/filter-context";
import { getDesigners, getDistinctProgramYears } from "@/lib/db/designers";
import { getTaxonomyGrouped } from "@/lib/db/taxonomy";

// The whole base is live data behind the admin session — never snapshot it.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Дизайн тащит — база учеников",
};

export default async function DesignerLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const [designers, taxonomy, years] = await Promise.all([
    getDesigners(),
    getTaxonomyGrouped(),
    getDistinctProgramYears(),
  ]);

  return (
    <div className="min-h-screen bg-[#161618] text-white">
      <DesignerFilterProvider designers={designers} taxonomy={taxonomy} years={years}>
        {children}
        {modal}
      </DesignerFilterProvider>
    </div>
  );
}
