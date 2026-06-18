// Menu Design theme model + helpers. The customer-facing menu reads a MenuTheme
// and renders accordingly. Persist `MenuTheme` to your DB and apply it on the
// guest ordering page.

export type PatternKey = "none" | "dots" | "stripes" | "grid";
export type LayoutKey = "list" | "card" | "grid";

export interface MenuTheme {
  color: string;
  pattern: PatternKey;
  layout: LayoutKey;
}

export const DEFAULT_THEME: MenuTheme = {
  color: "#8B6E5C",
  pattern: "none",
  layout: "list",
};

export const THEME_COLORS = [
  "#8B6E5C",
  "#C0703F",
  "#7E9A8F",
  "#9A8FB0",
  "#B5546A",
  "#4E6E8E",
];

export const PATTERN_KEYS: PatternKey[] = ["none", "dots", "stripes", "grid"];
export const LAYOUT_KEYS: LayoutKey[] = ["list", "card", "grid"];

/** CSS background for a pattern overlay (white lines over the theme color). */
export function patternBackground(pattern: PatternKey): {
  backgroundImage: string;
  backgroundSize: string;
} {
  switch (pattern) {
    case "dots":
      return {
        backgroundImage:
          "radial-gradient(rgba(255,255,255,.30) 1.7px, transparent 1.7px)",
        backgroundSize: "13px 13px",
      };
    case "stripes":
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,.16) 0, rgba(255,255,255,.16) 5px, transparent 5px, transparent 12px)",
        backgroundSize: "auto",
      };
    case "grid":
      return {
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,.16) 0, rgba(255,255,255,.16) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(90deg, rgba(255,255,255,.16) 0, rgba(255,255,255,.16) 1px, transparent 1px, transparent 14px)",
        backgroundSize: "auto",
      };
    default:
      return { backgroundImage: "none", backgroundSize: "auto" };
  }
}
