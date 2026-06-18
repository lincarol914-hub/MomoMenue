import type { DishIcon as DishIconType } from "../../lib/menu-data";

// Lightweight inline line-icons (no icon dependency). Inherit `color` via
// currentColor — set it on the wrapper.
export function DishIcon({
  type,
  size = 26,
}: {
  type: DishIconType;
  size?: number;
}) {
  const common = {
    viewBox: "0 0 48 48",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "noodle":
      return (
        <svg {...common}>
          <path d="M9 21h30" />
          <path d="M11 21l2.2 13.6a4 4 0 0 0 3.95 3.4h13.7a4 4 0 0 0 3.95-3.4L37 21" />
          <path d="M18 21c0-7 1.5-10 6-10s6 3 6 10" />
          <path d="M15 8l7 9" />
          <path d="M33 6l-6 11" />
        </svg>
      );
    case "chicken":
      return (
        <svg {...common}>
          <circle cx="24" cy="26" r="12" />
          <path d="M17 23h.01M24 21h.01M31 24h.01M20 30h.01M28 30h.01" />
          <path d="M12 18l4 3M36 18l-4 3" />
        </svg>
      );
    case "rice":
      return (
        <svg {...common}>
          <path d="M11 22h26" />
          <path d="M13 22l2.2 13a4 4 0 0 0 3.95 3.4h9.7a4 4 0 0 0 3.95-3.4L35 22" />
          <path d="M17 22c1-4.5 4-6.5 7-6.5s6 2 7 6.5" />
          <path d="M21 16h.01M24 14h.01M27 16h.01" />
        </svg>
      );
    case "veg":
      return (
        <svg {...common}>
          <circle cx="24" cy="25" r="12" />
          <path d="M18 26c2-4.5 7-5.5 13-4" />
          <path d="M22 21l-2-3M28 22l2-3" />
        </svg>
      );
    case "bun":
      return (
        <svg {...common}>
          <path d="M10 30c0-7 6-12 14-12s14 5 14 12" />
          <path d="M10 30h28v2a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" />
          <path d="M24 18v-3M18 21l-1-2.5M30 21l1-2.5" />
        </svg>
      );
    case "soup":
      return (
        <svg {...common}>
          <path d="M10 23h28" />
          <path d="M12 23l2 12a4 4 0 0 0 3.95 3.3h12.1a4 4 0 0 0 3.95-3.3L36 23" />
          <path d="M20 9c-2 2.5 2 4 0 6.5M28 9c-2 2.5 2 4 0 6.5" />
        </svg>
      );
    case "drink":
      return (
        <svg {...common}>
          <path d="M16 14h16l-1.8 22a3 3 0 0 1-3 2.8h-6.4a3 3 0 0 1-3-2.8z" />
          <path d="M18 21h12" />
          <path d="M24 8c2 1.5 1 3.5 0 5" />
        </svg>
      );
  }
}
