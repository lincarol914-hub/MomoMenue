import { DishStat } from "../../lib/analytics";
import { Lang, Dict, dishName } from "../../lib/i18n";
import { COLORS } from "../../lib/theme";
import { DishIcon } from "./DishIcon";

const RANK_BG = ["#C0703F", "#C99A6E", "#D8B08C", "#EAD9C7", "#EAD9C7"];

export function TopDishes({
  dishes,
  lang,
  t,
}: {
  dishes: DishStat[];
  lang: Lang;
  t: Dict;
}) {
  return (
    <section>
      <h3
        className="mb-3.5 text-base font-extrabold"
        style={{ color: COLORS.textStrong }}
      >
        🔥 {t.topDishes}
      </h3>
      <div className="flex flex-col gap-3">
        {dishes.map((d) => (
          <div key={d.id} className="flex items-center gap-3">
            <div
              className="flex flex-none items-center justify-center rounded-lg text-[13px] font-extrabold"
              style={{
                width: 26,
                height: 26,
                background: RANK_BG[d.rank - 1],
                color: d.rank <= 3 ? COLORS.surface : COLORS.brand,
              }}
            >
              {d.rank}
            </div>
            <div
              className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl"
              style={{ background: COLORS.cardAlt, color: "#A07E63" }}
            >
              <DishIcon type={d.icon} size={26} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className="truncate text-sm font-bold"
                  style={{ color: COLORS.textStrong }}
                >
                  {dishName(lang, d)}
                </span>
                <span
                  className="ml-2 flex-none text-[13px] font-bold"
                  style={{ color: COLORS.brand }}
                >
                  {t.sold} {d.sold}
                  {t.unit ? ` ${t.unit}` : ""}
                </span>
              </div>
              <div
                className="mt-1.5 h-2.5 overflow-hidden rounded-full"
                style={{ background: COLORS.track }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${d.barPct}%`,
                    background: d.rank === 1 ? COLORS.accent : "#C99A6E",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
