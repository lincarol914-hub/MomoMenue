import { computeAnalytics, RangeKey } from "../../lib/analytics";
import { DISHES } from "../../lib/menu-data";
import { Dict, Lang, dishName } from "../../lib/i18n";
import { COLORS } from "../../lib/theme";
import { RangeTabs } from "./RangeTabs";
import { StatCard } from "./StatCard";
import { InsightBanner } from "./InsightBanner";
import { TopDishes } from "./TopDishes";
import { CategoryMix } from "./CategoryMix";
import { PeakHours } from "./PeakHours";
import { Icon } from "./Icon";

export function StatsScreen({
  t,
  lang,
  range,
  onRange,
  onBack,
}: {
  t: Dict;
  lang: Lang;
  range: RangeKey;
  onRange: (r: RangeKey) => void;
  onBack: () => void;
}) {
  const a = computeAnalytics(range);
  const yuan = (n: number) => `¥${n.toLocaleString()}`;
  const topDish = DISHES.find((d) => d.id === a.topDishId);
  const insight = topDish
    ? `${dishName(lang, topDish)} ${t.insightMid} ${a.topDishShare}%${t.insightTail ? ` ${t.insightTail}` : ""}`
    : "";

  return (
    <div className="pb-8 pt-1.5">
      <div className="flex items-center justify-between px-[22px] pb-4 pt-1">
        <button type="button" onClick={onBack} className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px]" style={{ background: COLORS.cardAlt, color: COLORS.brand }}>
          <Icon name="back" size={22} />
        </button>
        <div className="text-lg font-extrabold" style={{ color: COLORS.textStrong }}>{t.statsTitle}</div>
        <div className="w-[42px]" />
      </div>

      <div className="px-[22px] pb-4">
        <RangeTabs value={range} onChange={onRange} labels={{ today: t.today, week: t.week, month: t.month }} />
      </div>

      <div className="flex gap-2.5 px-[22px]">
        <StatCard value={String(a.orders)} label={t.orders} />
        <StatCard value={yuan(a.revenue)} label={t.revenue} variant="brand" />
        <StatCard value={yuan(a.avgTicket)} label={t.avgTicket} />
      </div>

      <div className="px-[22px] pt-4">
        <InsightBanner text={insight} />
      </div>

      <div className="flex flex-col gap-7 px-[22px] pt-7">
        <TopDishes dishes={a.topDishes} lang={lang} t={t} />
        <CategoryMix mix={a.categoryMix} t={t} />
        <PeakHours buckets={a.peakHours} t={t} />
      </div>
    </div>
  );
}
