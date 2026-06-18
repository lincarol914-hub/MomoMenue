import { CategoryStat } from "../../lib/analytics";
import { Dict, categoryLabel } from "../../lib/i18n";
import { COLORS } from "../../lib/theme";

export function CategoryMix({
  mix,
  t,
}: {
  mix: CategoryStat[];
  t: Dict;
}) {
  return (
    <section>
      <h3
        className="mb-3.5 text-base font-extrabold"
        style={{ color: COLORS.textStrong }}
      >
        {t.categoryMix}
      </h3>

      {/* stacked proportion bar */}
      <div className="flex h-[18px] gap-0.5 overflow-hidden rounded-full">
        {mix.map((c) => (
          <div
            key={c.category}
            style={{ width: `${c.pct}%`, background: c.color }}
          />
        ))}
      </div>

      {/* legend */}
      <div className="mt-4 flex flex-wrap gap-x-[18px] gap-y-3">
        {mix.map((c) => (
          <div key={c.category} className="flex items-center gap-2">
            <span
              className="h-[11px] w-[11px] rounded-[3px]"
              style={{ background: c.color }}
            />
            <span
              className="text-[13px] font-semibold"
              style={{ color: "#6B5447" }}
            >
              {categoryLabel(t, c.category)}
            </span>
            <span className="text-[13px]" style={{ color: COLORS.textMuted }}>
              {c.pct}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
