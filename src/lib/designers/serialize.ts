import type { Designer } from "./types";

export type Audience = "internal" | "public";

/**
 * Single seam for field-level visibility (spec §16). v1: every audience sees
 * everything. A future public share view can strip internal-only fields here
 * without touching any caller or the DB schema.
 */
export function serializeDesigner(designer: Designer, audience: Audience = "internal"): Designer {
  if (audience === "public") {
    // TODO: strip internal-only fields once a public share view exists.
    return designer;
  }
  return designer;
}
