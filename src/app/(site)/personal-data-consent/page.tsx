import { LegalDocument } from "@/components/legal-document";
import { personalDataConsent } from "@/lib/legal/personal-data-consent";

export default function PersonalDataConsentPage() {
  return <LegalDocument {...personalDataConsent} />;
}
