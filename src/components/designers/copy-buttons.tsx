"use client";

import { useState } from "react";

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({
  getText,
  idle,
  done = "Скопировано",
  className,
}: {
  getText: () => string;
  idle: string;
  done?: string;
  className: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        if (await copy(getText())) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
      className={className}
    >
      {copied ? done : idle}
    </button>
  );
}
