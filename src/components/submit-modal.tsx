"use client";

import { useState } from "react";
import { XIcon } from "./x-icon";

const inputClass =
  "h-11 w-full rounded-[10px] border border-[#3A3A3D] bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none";

export function SubmitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const close = () => {
    onClose();
    setSubmitted(false);
    setAgreed(false);
  };

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

        {submitted ? (
          <div className="py-4 text-center">
            <h2 className="text-xl font-medium text-white">Thank you!</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              I&apos;ve got your portfolio and will take a close look. I&apos;ll reach out to discuss how best to
              publish it.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <h2 className="pr-8 text-xl font-medium text-white">Want to be in the gallery?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Send your portfolio — I&apos;ll take a close look and reach out to discuss how best to publish it.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <input type="text" required placeholder="Full name" className={inputClass} />
              <input type="email" required placeholder="E-mail" className={inputClass} />
              <input type="text" required placeholder="Telegram / LinkedIn" className={inputClass} />
              <input type="url" required placeholder="Link to your portfolio" className={inputClass} />
            </div>

            <label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/50">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border-[#3A3A3D] bg-transparent accent-white"
              />
              I agree to the processing of my data to be considered for the portfolio gallery.
            </label>

            <button
              type="submit"
              className="mt-6 h-11 w-full rounded-[10px] bg-white text-sm font-medium text-black/90 hover:bg-white/90"
            >
              Submit portfolio
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
