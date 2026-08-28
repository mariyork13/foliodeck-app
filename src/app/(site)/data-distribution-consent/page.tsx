import { LegalDocument } from "@/components/legal-document";
import { dataDistributionConsent } from "@/lib/legal/data-distribution-consent";

export default function DataDistributionConsentPage() {
  return <LegalDocument {...dataDistributionConsent} />;
}
