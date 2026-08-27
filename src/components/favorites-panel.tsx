"use client";

import { curators } from "@/lib/curators";
import { useFavorites } from "@/lib/favorites-context";
import { CuratorCard } from "./curator-card";
import { XIcon } from "./x-icon";

export function FavoritesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { favorites } = useFavorites();

  if (!open) return null;

  const favoritedCurators = curators.filter((c) => favorites.includes(c.slug));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed bottom-3 right-3 top-3 z-50 flex w-full max-w-[480px] flex-col rounded-xl bg-[#212124]/70 p-4 backdrop-blur-[74px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Favorites</h2>
          <button
            onClick={onClose}
            aria-label="Close favorites"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            <XIcon />
          </button>
        </div>

        {favoritedCurators.length === 0 ? (
          <p className="text-white/40">You haven&apos;t added anything yet!</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 overflow-y-auto">
            {favoritedCurators.map((curator) => (
              <CuratorCard key={curator.slug} curator={curator} compact />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
