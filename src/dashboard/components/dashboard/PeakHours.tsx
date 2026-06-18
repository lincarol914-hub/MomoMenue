import { PeakBucket } from "../../lib/analytics";
import { Dict } from "../../lib/i18n";
import { COLORS } from "../../lib/theme";

export function PeakHours({
  buckets,
  t,
}: {
  buckets: PeakBucket[];
  t: Dict;
}) {
  return (
    <section>
      <h3
        className="mb-3.5 text-base font-extrabold"
        style={{ color: COLORS.textStrong }}
      >
        {t.peakHours}
      </h3>

      <div className="flex h-[120px] items-end gap-2.5">
        {buckets.map((b) => (
          <div
            key={b.label}
            className="flex h-full flex-1 items-end justify-center"
          >
            <div
              className="w-full rounded-t-[7px] rounded-b-[3px] transition-[height] duration-500"
              style={{
                height: `${Math.round((b.intensity / 100) * 104 + 8)}px`,
                background: b.isPeak ? COLORS.accent : "#C99A6E",
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2.5">
        {buckets.map((b) => (
          <div
            key={b.label}
            className="flex-1 text-center text-[10px] font-semibold"
            style={{ color: COLORS.textMuted }}
          >
            {b.label}
          </div>
        ))}
      </div>
    </section>
  );
}
