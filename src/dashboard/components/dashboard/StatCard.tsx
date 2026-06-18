import { COLORS, CARD_SHADOW } from "../../lib/theme";

export function StatCard({
  value,
  label,
  variant = "light",
}: {
  value: string;
  label: string;
  variant?: "light" | "brand";
}) {
  const isBrand = variant === "brand";
  return (
    <div
      className="flex-1 rounded-2xl p-4"
      style={{
        background: isBrand ? COLORS.brand : COLORS.card,
        boxShadow: isBrand ? undefined : CARD_SHADOW,
      }}
    >
      <div
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: isBrand ? COLORS.surface : COLORS.textStrong }}
      >
        {value}
      </div>
      <div
        className="mt-1.5 text-xs"
        style={{ color: isBrand ? "#E7D8CA" : COLORS.textMuted }}
      >
        {label}
      </div>
    </div>
  );
}
