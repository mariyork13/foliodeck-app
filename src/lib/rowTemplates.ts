import type { CardSize } from "./types";

// The live site repeats a fixed cycle of hand-designed row layouts instead
// of a generic masonry/auto-packing algorithm. Each template lists the card
// sizes (left to right) for one row; the gallery cycles through this list
// as it lays out the full curator feed. More templates (rows 3-8 on the
// live site) get appended here once confirmed.
export const ROW_TEMPLATES: CardSize[][] = [
  ["big", "small", "small"],
  ["small", "small", "small", "small"],
];

export function chunkIntoRows<T>(items: T[]): { size: CardSize; item: T }[][] {
  const rows: { size: CardSize; item: T }[][] = [];
  let cursor = 0;
  let templateIndex = 0;

  while (cursor < items.length) {
    const template = ROW_TEMPLATES[templateIndex % ROW_TEMPLATES.length];
    const row = template.map((size, i) => ({ size, item: items[cursor + i] })).filter((cell) => cell.item);
    if (row.length > 0) rows.push(row);
    cursor += template.length;
    templateIndex += 1;
  }

  return rows;
}
