// Seasonal branding — mirrors the same logic in the main website repo
// (src/components/effects/season.ts) so the logo matches across both.
export type Season = "spring" | "summer" | "autumn" | "winter";

export function getSeason(d: Date = new Date()): Season {
  const m = d.getMonth(); // 0 = January
  if (m === 11 || m === 0 || m === 1) return "winter";
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  return "autumn";
}

/** Current season's hand+leaf logo SVG, served from public/brand/. */
export function getSeasonLogo(): string {
  return `/brand/season-${getSeason()}.svg`;
}
