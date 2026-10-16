import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";

export const metadata: Metadata = {
  title: "Page not found — Foliodeck",
};

// Root not-found: catches unmatched URLs and every notFound() call (unknown
// curator slugs, etc.). Renders inside the root layout only — no site header,
// since that one needs the (site) group's curator data.
export default function NotFound() {
  return <NotFoundContent />;
}
