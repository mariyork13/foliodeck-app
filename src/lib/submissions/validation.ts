// Field validation shared by the public form (instant feedback) and the server
// action (source of truth). Messages are the exact spec strings.

export type SubmissionFields = {
  name: string;
  email: string;
  contact: string;
  specialization: string;
  portfolioUrl: string;
  consentProcessing: boolean;
  consentDisclosure: boolean;
};

export type FieldErrors = Partial<Record<keyof SubmissionFields | "consent", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSubmission(fields: SubmissionFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = "Please enter your name.";
  }
  if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!fields.contact.trim()) {
    errors.contact = "Please provide your Telegram or LinkedIn.";
  }
  if (!fields.specialization.trim()) {
    errors.specialization = "Please enter your specialization.";
  }
  if (!isHttpUrl(fields.portfolioUrl.trim())) {
    errors.portfolioUrl = "Please enter a valid portfolio URL.";
  }
  if (!fields.consentProcessing || !fields.consentDisclosure) {
    errors.consent = "Please provide the required consent to continue.";
  }

  return errors;
}
