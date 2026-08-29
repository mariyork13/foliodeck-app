import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DesignerFilterProvider } from "@/lib/designers/filter-context";
import { getDesigners, getDistinctProgramYears } from "@/lib/db/designers";
import { getTaxonomyGrouped } from "@/lib/db/taxonomy";

// The whole base is live data behind the admin session — never snapshot it.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Выпускники — база учеников",
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
    <AdminShell>
      <DesignerFilterProvider designers={designers} taxonomy={taxonomy} years={years}>
        {children}
        {modal}
      </DesignerFilterProvider>
    </AdminShell>
  );
}
