import {
  siNasa,
  siRevolut,
  siRoblox,
  siSpotify,
  siTesla,
  siTwitch,
  siVk,
} from "simple-icons";

// Best-effort match from real-world brand names to simple-icons' offline SVG
// icon set. Names with no reliable match (regional brands, small studios)
// are intentionally left unmapped and fall back to a plain placeholder.
export const companyLogos: Record<string, { path: string; hex: string }> = {
  NASA: siNasa,
  Revolut: siRevolut,
  Roblox: siRoblox,
  Spotify: siSpotify,
  Tesla: siTesla,
  Twitch: siTwitch,
  VK: siVk,
};
