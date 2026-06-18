import { COLORS } from "../../lib/theme";

function SparkIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M24 10l2.8 8.4L35 21l-8.2 2.6L24 32l-2.8-8.4L13 21l8.2-2.6z" />
    </svg>
  );
}

export function InsightBanner({ text }: { text: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3.5"
      style={{ background: COLORS.accentSoft }}
    >
      <span className="flex-none" style={{ color: COLORS.accent }}>
        <SparkIcon />
      </span>
      <p
        className="text-[13.5px] font-semibold leading-snug"
        style={{ color: "#A05A2E" }}
      >
        {text}
      </p>
    </div>
  );
}
