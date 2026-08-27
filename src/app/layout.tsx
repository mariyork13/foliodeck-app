import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SubscribeBanner } from "@/components/subscribe-banner";
import { FavoritesProvider } from "@/lib/favorites-context";
import { FilterProvider } from "@/lib/filter-context";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Foliodeck — a curated portfolio gallery",
  description: "A curated portfolio gallery of designers, developers, and studios by Maria Chubina.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#161618]">
        <FilterProvider>
          <FavoritesProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <SubscribeBanner />
          </FavoritesProvider>
        </FilterProvider>
      </body>
    </html>
  );
}
