import { LegalDocument } from "@/components/legal-document";
import { privacyPolicy } from "@/lib/legal/privacy-policy";

export default function PrivacyPolicyPage() {
  return <LegalDocument {...privacyPolicy} />;
}
