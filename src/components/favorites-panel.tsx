"use client";

import { useFavorites } from "@/lib/favorites-context";
import type { Curator } from "@/lib/types";
import { CuratorCard } from "./curator-card";
import { XIcon } from "./x-icon";

export function FavoritesPanel({
  open,
  onClose,
  curators,
}: {
  open: boolean;
  onClose: () => void;
  curators: Curator[];
}) {
  const { favorites } = useFavorites();

  if (!open) return null;

  const favoritedCurators = curators.filter((c) => favorites.includes(c.slug));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-3 z-50 flex flex-col rounded-xl bg-[#212124]/70 p-4 backdrop-blur-[74px] sm:left-auto sm:w-full sm:max-w-[480px]">
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
          <div className="grid grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2">
            {favoritedCurators.map((curator) => (
              <CuratorCard key={curator.slug} curator={curator} compact />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
