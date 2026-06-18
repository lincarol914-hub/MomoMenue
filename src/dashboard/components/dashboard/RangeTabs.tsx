"use client";

import { RangeKey } from "../../lib/analytics";
import { COLORS } from "../../lib/theme";

export function RangeTabs({
  value,
  onChange,
  labels,
}: {
  value: RangeKey;
  onChange: (r: RangeKey) => void;
  labels: Record<RangeKey, string>;
}) {
  const keys: RangeKey[] = ["today", "week", "month"];
  return (
    <div className="flex gap-2">
      {keys.map((k) => {
        const active = k === value;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className="flex-1 rounded-xl px-2 py-2.5 text-sm font-bold transition-colors"
            style={{
              background: active ? COLORS.brand : COLORS.cardAlt,
              color: active ? COLORS.surface : COLORS.brand,
            }}
          >
            {labels[k]}
          </button>
        );
      })}
    </div>
  );
}
