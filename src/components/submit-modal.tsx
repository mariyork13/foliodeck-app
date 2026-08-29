"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { submitPortfolioAction } from "@/lib/actions/submissions";
import { validateSubmission, type FieldErrors } from "@/lib/submissions/validation";
import { MultiSelect } from "./multi-select";
import { XIcon } from "./x-icon";

const inputClass =
  "h-11 w-full rounded-[10px] border border-[#3A3A3D] bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none";
const errorClass = "mt-1 text-xs text-red-400";

function FieldError({ message }: { message?: string }) {
  return message ? <p className={errorClass}>{message}</p> : null;
}

export function SubmitModal({
  open,
  onClose,
  specializations,
}: {
  open: boolean;
  onClose: () => void;
  specializations: string[];
}) {
  const [state, formAction, isPending] = useActionState(submitPortfolioAction, null);
  const [agreedProcessing, setAgreedProcessing] = useState(false);
  const [agreedDistribution, setAgreedDistribution] = useState(false);
  const [specs, setSpecs] = useState<string[]>([]);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [retry, setRetry] = useState(false);

  if (!open) return null;

  const close = () => {
    onClose();
    setAgreedProcessing(false);
    setAgreedDistribution(false);
    setSpecs([]);
    setClientErrors({});
    setRetry(false);
  };

  const errors: FieldErrors =
    Object.keys(clientErrors).length > 0
      ? clientErrors
      : state && !state.ok && state.error === "validation"
        ? state.fields
        : {};

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setRetry(false);
    const formData = new FormData(event.currentTarget);
    const found = validateSubmission({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      contact: String(formData.get("contact") ?? ""),
      specialization: specs.join(", "),
      portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
      consentProcessing: agreedProcessing,
      consentDisclosure: agreedDistribution,
    });
    setClientErrors(found);
    if (Object.keys(found).length > 0) {
      event.preventDefault();
    }
  };

  const showSuccess = state?.ok === true;
  const showError = !showSuccess && state != null && !state.ok && state.error === "server" && !retry;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={close} />
      <div className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#161618]/70 p-8 backdrop-blur-[74px]">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
        >
          <XIcon />
        </button>

        {showSuccess ? (
          <div className="py-4 text-center">
            <h2 className="text-xl font-medium text-white">Portfolio submitted</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Thank you! Your portfolio has been submitted for review.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/40">
              We&apos;ll contact you if we need any additional information.
            </p>
          </div>
        ) : showError ? (
          <div className="py-4 text-center">
            <h2 className="text-xl font-medium text-white">Something went wrong</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              We couldn&apos;t submit your portfolio. Please try again.
            </p>
            <button
              type="button"
              onClick={() => setRetry(true)}
              className="mt-6 h-11 w-full rounded-[10px] bg-white text-sm font-medium text-black/90 hover:bg-white/90"
            >
              Try again
            </button>
          </div>
        ) : (
          <form action={formAction} onSubmit={handleSubmit} noValidate>
            <h2 className="pr-8 text-xl font-medium text-white">Want to be in the gallery?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Send your portfolio and we&apos;ll review it.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <div>
                <input name="name" type="text" placeholder="Name" className={inputClass} />
                <FieldError message={errors.name} />
              </div>
              <div>
                <input name="email" type="email" placeholder="Email" className={inputClass} />
                <FieldError message={errors.email} />
              </div>
              <div>
                <input
                  name="contact"
                  type="text"
                  placeholder="Telegram or LinkedIn"
                  className={inputClass}
                />
                <FieldError message={errors.contact} />
              </div>
              <div>
                <MultiSelect
                  options={specializations}
                  value={specs}
                  onChange={setSpecs}
                  placeholder="Specialization"
                />
                <input type="hidden" name="specialization" value={specs.join(", ")} />
                <FieldError message={errors.specialization} />
              </div>
              <div>
                <input
                  name="portfolioUrl"
                  type="url"
                  placeholder="Portfolio URL"
                  className={inputClass}
                />
                <FieldError message={errors.portfolioUrl} />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <label className="flex items-start gap-2 text-xs leading-relaxed text-white/50">
                <input
                  type="checkbox"
                  name="consentProcessing"
                  checked={agreedProcessing}
                  onChange={(e) => setAgreedProcessing(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border-[#3A3A3D] bg-transparent accent-white"
                />
                <span>
                  I consent to the processing of my personal data and confirm that I have read the{" "}
                  <Link href="/privacy-policy" target="_blank" className="underline hover:text-white/80">
                    Privacy and Personal Data Processing Policy
                  </Link>{" "}
                  (
                  <Link href="/personal-data-consent" target="_blank" className="underline hover:text-white/80">
                    full text
                  </Link>
                  ).
                </span>
              </label>
              <label className="flex items-start gap-2 text-xs leading-relaxed text-white/50">
                <input
                  type="checkbox"
                  name="consentDisclosure"
                  checked={agreedDistribution}
                  onChange={(e) => setAgreedDistribution(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border-[#3A3A3D] bg-transparent accent-white"
                />
                <span>
                  I consent to the processing and{" "}
                  <Link
                    href="/data-distribution-consent"
                    target="_blank"
                    className="underline hover:text-white/80"
                  >
                    public disclosure of my personal data
                  </Link>{" "}
                  on foliodeck.pro.
                </span>
              </label>
              <FieldError message={errors.consent} />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-6 h-11 w-full rounded-[10px] bg-white text-sm font-medium text-black/90 hover:bg-white/90 disabled:opacity-60"
            >
              {isPending ? "Submitting…" : "Submit portfolio"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
