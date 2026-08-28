"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import {
  deleteCuratorAction,
  moveCuratorToEdgeAction,
  setCuratorPositionAction,
} from "@/lib/actions/curators";
import type { CuratorRecord } from "@/lib/db/curators";

export function PortfolioList({
  items,
  startIndex,
  reorderable,
}: {
  items: CuratorRecord[];
  /** 0-based index of the first row within the full ordered list. */
  startIndex: number;
  /** Drag + edge moves only make sense on the unfiltered, full list. */
  reorderable: boolean;
}) {
  const [rows, setRows] = useState(items);
  const [isPending, startTransition] = useTransition();
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // Re-sync when the server sends a fresh page (after revalidation, search, paging).
  const [seenItems, setSeenItems] = useState(items);
  if (items !== seenItems) {
    setSeenItems(items);
    setRows(items);
  }

  const persist = (id: number, globalIndex: number) => {
    startTransition(async () => {
      await setCuratorPositionAction(id, globalIndex);
    });
  };

  const handleDrop = (targetLocal: number) => {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    if (from === null || from === targetLocal) return;

    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(targetLocal, 0, moved);
    setRows(next);
    persist(moved.id, startIndex + targetLocal);
  };

  const moveToEdge = (id: number, edge: "top" | "bottom") => {
    startTransition(async () => {
      await moveCuratorToEdgeAction(id, edge);
    });
  };

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/10 text-white/50">
          <th className="w-16 py-2 font-normal">#</th>
          <th className="py-2 font-normal">Имя</th>
          <th className="py-2 font-normal">Роль</th>
          <th className="py-2 font-normal">Slug</th>
          <th className="w-64 py-2 font-normal"></th>
        </tr>
      </thead>
      <tbody className={isPending ? "opacity-60" : ""}>
        {rows.map((curator, index) => (
          <tr
            key={curator.id}
            draggable={reorderable}
            onDragStart={() => {
              dragFrom.current = index;
            }}
            onDragOver={(e) => {
              if (!reorderable) return;
              e.preventDefault();
              setDragOver(index);
            }}
            onDragLeave={() => setDragOver((cur) => (cur === index ? null : cur))}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => {
              dragFrom.current = null;
              setDragOver(null);
            }}
            className={`border-b border-white/5 ${dragOver === index ? "border-t-2 border-t-white/60" : ""}`}
          >
            <td className="py-2 text-white/40">
              <span className="flex items-center gap-2">
                {reorderable && <span className="cursor-grab select-none text-white/30">⠿</span>}
                {reorderable ? startIndex + index + 1 : "—"}
              </span>
            </td>
            <td className="py-2">{curator.name}</td>
            <td className="py-2 text-white/60">{curator.role}</td>
            <td className="py-2 text-white/40">{curator.slug}</td>
            <td className="py-2">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => moveToEdge(curator.id, "top")}
                  className="text-white/50 hover:text-white"
                  title="В начало списка"
                >
                  ↑ В начало
                </button>
                <button
                  type="button"
                  onClick={() => moveToEdge(curator.id, "bottom")}
                  className="text-white/50 hover:text-white"
                  title="В конец списка"
                >
                  ↓ В конец
                </button>
                <Link
                  href={`/admin/curators/${curator.id}/edit`}
                  className="text-white/70 hover:text-white"
                >
                  Изменить
                </Link>
                <form action={deleteCuratorAction.bind(null, curator.id)} className="inline">
                  <button type="submit" className="text-red-400/80 hover:text-red-400">
                    Удалить
                  </button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
