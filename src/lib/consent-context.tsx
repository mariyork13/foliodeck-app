"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// "pending"   — the visitor hasn't answered the cookie banner yet
// "all"       — analytics cookies allowed (Yandex Metrica may load)
// "necessary" — only technically necessary cookies
export type Consent = "pending" | "all" | "necessary";

const STORAGE_KEY = "foliodeck-cookie-consent";

type ConsentContextValue = {
  consent: Consent;
  accept: () => void;
  reject: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function read(): Consent {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "all" || v === "necessary") return v;
    // Legacy value from the old single-button banner — that banner never
    // offered analytics, so treat it as "necessary only".
    if (v === "1") return "necessary";
  } catch {
    // ignore
  }
  return "pending";
}

function write(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  // SSR renders "pending" (banner hidden until mount); the effect syncs the
  // stored choice after hydration.
  const [consent, setConsent] = useState<Consent>("pending");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(read());
  }, []);

  const accept = () => {
    setConsent("all");
    write("all");
  };
  const reject = () => {
    setConsent("necessary");
    write("necessary");
  };

  return (
    <ConsentContext.Provider value={{ consent, accept, reject }}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}
