// The live site repeats a fixed cycle of hand-designed row layouts instead
// of a generic masonry/auto-packing algorithm. Each row renders as a
// 12-column CSS grid (so a "small" card is colSpan 3, "medium" is colSpan
// 4, "big" is colSpan 6). Most slots just auto-place left to right; a slot
// only needs colStart/rowStart when it's explicitly offset (a stagger, or
// a deliberate empty gap). `align` controls whether cards in the row sit
// at the top or bottom of the row's height.
export type RowSlot = {
  colSpan: number;
  rowSpan?: number;
  colStart?: number;
  rowStart?: number;
};

export type RowTemplate = {
  slots: RowSlot[];
  align?: "start" | "end";
};

export const ROW_TEMPLATES: RowTemplate[] = [
  // Row 1: one big card + two small, top-aligned.
  { slots: [{ colSpan: 6 }, { colSpan: 3 }, { colSpan: 3 }] },
  // Row 2: four small cards in a line.
  { slots: [{ colSpan: 3 }, { colSpan: 3 }, { colSpan: 3 }, { colSpan: 3 }] },
  // Row 3: small top-left (empty below), small bottom-shifted-right (empty
  // above), then a big card spanning both rows further to the right.
  {
    slots: [
      { colSpan: 3, rowSpan: 1, colStart: 1, rowStart: 1 },
      { colSpan: 3, rowSpan: 1, colStart: 4, rowStart: 2 },
      { colSpan: 6, rowSpan: 2, colStart: 7, rowStart: 1 },
    ],
  },
  // Row 4: three medium cards in a line.
  { slots: [{ colSpan: 4 }, { colSpan: 4 }, { colSpan: 4 }] },
  // Row 5: a big card, then a deliberate empty gap, then a medium card
  // top-aligned on the right.
  { slots: [{ colSpan: 6, colStart: 1 }, { colSpan: 4, colStart: 9 }] },
  // Row 6: four small cards in a line (same shape as row 2).
  { slots: [{ colSpan: 3 }, { colSpan: 3 }, { colSpan: 3 }, { colSpan: 3 }] },
  // Row 7: two small cards side by side, then a big card — all bottom-aligned.
  {
    slots: [{ colSpan: 3, colStart: 1 }, { colSpan: 3, colStart: 4 }, { colSpan: 6, colStart: 7 }],
    align: "end",
  },
  // Row 8: two big cards side by side.
  { slots: [{ colSpan: 6 }, { colSpan: 6 }] },
];

export function chunkIntoRows<T>(items: T[]): { template: RowTemplate; cells: { slot: RowSlot; card: T }[] }[] {
  const rows: { template: RowTemplate; cells: { slot: RowSlot; card: T }[] }[] = [];
  let cursor = 0;
  let templateIndex = 0;

  while (cursor < items.length) {
    const template = ROW_TEMPLATES[templateIndex % ROW_TEMPLATES.length];
    const cells = template.slots
      .map((slot, i) => ({ slot, card: items[cursor + i] }))
      .filter((cell) => cell.card !== undefined);

    if (cells.length > 0) rows.push({ template, cells });
    cursor += template.slots.length;
    templateIndex += 1;
  }

  return rows;
}
