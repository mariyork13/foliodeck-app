import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Школа ДТ",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <div className="mx-auto max-w-[1920px] px-4 pb-24 pt-4">{children}</div>
    </AdminShell>
  );
}
