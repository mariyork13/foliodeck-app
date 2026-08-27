"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "foliodeck-favorites";

type FavoritesContextValue = {
  favorites: string[];
  isFavorited: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // One-time sync from localStorage on mount, after hydration, to avoid a
    // server/client mismatch (SSR always renders with no favorites).
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // ignore malformed/unavailable storage
    }
  }, []);

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isFavorited = (slug: string) => favorites.includes(slug);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
