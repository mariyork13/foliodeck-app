import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FavoritesProvider } from "@/lib/favorites-context";
import { FilterProvider } from "@/lib/filter-context";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Foliodeck — курируемая галерея портфолио",
  description: "Курируемая галерея портфолио дизайнеров, разработчиков и студий от Марии Чубиной.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#161618]">
        <FilterProvider>
          <FavoritesProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </FavoritesProvider>
        </FilterProvider>
      </body>
    </html>
  );
}
