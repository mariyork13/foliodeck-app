"use client";

import { curators } from "@/lib/curators";
import { useFavorites } from "@/lib/favorites-context";
import { CuratorCard } from "./curator-card";

export function FavoritesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { favorites } = useFavorites();

  if (!open) return null;

  const favoritedCurators = curators.filter((c) => favorites.includes(c.slug));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed bottom-3 right-3 top-3 z-50 flex w-full max-w-[420px] flex-col rounded-xl bg-[#212124]/70 p-6 backdrop-blur-[74px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Избранное</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть избранное"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {favoritedCurators.length === 0 ? (
          <p className="text-white/40">Вы еще ничего не добавили!</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 overflow-y-auto">
            {favoritedCurators.map((curator) => (
              <CuratorCard key={curator.slug} curator={curator} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
