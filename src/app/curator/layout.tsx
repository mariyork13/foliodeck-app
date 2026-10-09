import { CookieBanner } from "@/components/cookie-banner";
import { YandexMetrica } from "@/components/yandex-metrica";
import { ConsentProvider } from "@/lib/consent-context";

// Curator pages are full-screen (no site header/footer), but they're public
// pages like the rest of the site — same cookie banner, same analytics.
export default function CuratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex flex-col-reverse items-center gap-3 px-4 sm:px-0">
        <CookieBanner />
      </div>
      <YandexMetrica />
    </ConsentProvider>
  );
}
