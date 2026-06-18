// Inline line-icons for nav + quick actions. Inherit color via currentColor.

export type IconName =
  | "home"
  | "overview"
  | "stats"
  | "design"
  | "qr"
  | "back"
  | "pin";

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
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
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M9 22l15-12 15 12" />
          <path d="M13 20v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V20" />
          <path d="M20 37v-9h8v9" />
        </svg>
      );
    case "overview":
      return (
        <svg {...common}>
          <path d="M10 38h28" />
          <rect x="13" y="24" width="6" height="11" rx="1.5" />
          <rect x="22" y="16" width="6" height="19" rx="1.5" />
          <rect x="31" y="28" width="6" height="7" rx="1.5" />
          <path d="M13 19l8-7 6 4 8-8" />
        </svg>
      );
    case "stats":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="14" />
          <path d="M24 24V10" />
          <path d="M24 24l10 4" />
        </svg>
      );
    case "design":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="34" height="34" rx="8" />
          <path d="M7 19h34" />
          <path d="M19 19v22" />
        </svg>
      );
    case "qr":
      return (
        <svg {...common}>
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <rect x="29" y="8" width="11" height="11" rx="2" />
          <rect x="8" y="29" width="11" height="11" rx="2" />
          <path d="M29 29h5v5M40 29v.01M40 34v6M34 40h6" />
        </svg>
      );
    case "back":
      return (
        <svg {...common}>
          <path d="M28 12L16 24l12 12" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M24 9a10 10 0 0 0-10 10c0 7 10 18 10 18s10-11 10-18A10 10 0 0 0 24 9z" />
          <circle cx="24" cy="19" r="4" />
        </svg>
      );
  }
}
