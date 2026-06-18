import { computeOverview, RangeKey } from "../../lib/analytics";
import { statusCounts } from "../../lib/orders-data";
import { Dict } from "../../lib/i18n";
import { COLORS, CARD_SHADOW } from "../../lib/theme";
import { RangeTabs } from "./RangeTabs";
import { Icon } from "./Icon";

export function OverviewScreen({
  t,
  range,
  onRange,
  onBack,
}: {
  t: Dict;
  range: RangeKey;
  onRange: (r: RangeKey) => void;
  onBack: () => void;
}) {
  const o = computeOverview(range);
  const counts = statusCounts();
  const yuan = (n: number) => `¥${n.toLocaleString()}`;
  const trendLabels = ["一", "二", "三", "四", "五", "六", "日"];

  return (
    <div className="pb-8 pt-1.5">
      <Header title={t.ovTitle} onBack={onBack} />

      <div className="px-[22px] pb-4">
        <RangeTabs value={range} onChange={onRange} labels={{ today: t.today, week: t.week, month: t.month }} />
      </div>

      {/* revenue hero */}
      <div className="px-[22px]">
        <div className="rounded-[22px] p-[22px]" style={{ background: COLORS.brand }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[13px]" style={{ color: "#E7D8CA" }}>{t.revenue}</div>
              <div className="mt-1 text-[40px] font-extrabold tracking-tighter" style={{ color: COLORS.surface }}>{yuan(o.revenue)}</div>
            </div>
            <div className="rounded-xl px-2.5 py-1.5 text-[13px] font-extrabold" style={{ background: "rgba(255,249,243,.16)", color: COLORS.surface }}>↑ {o.trendPct}</div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-2.5 px-[22px] pt-3.5">
        <Kpi value={String(o.orders)} label={t.orders} />
        <Kpi value={yuan(o.avgTicket)} label={t.avgTicket} />
        <Kpi value={o.turnover} label={t.ovTurnover} />
        <Kpi value={o.occupancy} label={t.ovOccupancy} accent />
      </div>

      {/* revenue trend */}
      <h3 className="px-[22px] pb-3.5 pt-7 text-base font-extrabold" style={{ color: COLORS.textStrong }}>{t.ovTrend}</h3>
      <div className="px-[22px]">
        <div className="flex h-[120px] items-end gap-2">
          {o.trend.map((b, i) => (
            <div key={i} className="flex h-full flex-1 items-end justify-center">
              <div
                className="w-full rounded-t-md rounded-b-[3px] transition-[height] duration-500"
                style={{ height: `${Math.round((b.intensity / 100) * 104 + 8)}px`, background: b.isPeak ? COLORS.accent : "#C99A6E" }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {trendLabels.map((l) => (
            <div key={l} className="flex-1 text-center text-[10px] font-semibold" style={{ color: COLORS.textMuted }}>{l}</div>
          ))}
        </div>
      </div>

      {/* order status */}
      <h3 className="px-[22px] pb-3.5 pt-7 text-base font-extrabold" style={{ color: COLORS.textStrong }}>{t.ovOrderStatus}</h3>
      <div className="flex gap-2.5 px-[22px]">
        <StatusChip value={counts.new} label={t.sNew} color={COLORS.accent} />
        <StatusChip value={counts.making} label={t.sMaking} color={COLORS.brand} />
        <StatusChip value={counts.done} label={t.sDone} color={COLORS.textMuted} />
      </div>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between px-[22px] pb-4 pt-1">
      <button type="button" onClick={onBack} className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px]" style={{ background: COLORS.cardAlt, color: COLORS.brand }}>
        <Icon name="back" size={22} />
      </button>
      <div className="text-lg font-extrabold" style={{ color: COLORS.textStrong }}>{title}</div>
      <div className="w-[42px]" />
    </div>
  );
}

function Kpi({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-[18px] p-4" style={{ background: COLORS.card, boxShadow: CARD_SHADOW }}>
      <div className="text-2xl font-extrabold tracking-tight" style={{ color: accent ? COLORS.accent : COLORS.textStrong }}>{value}</div>
      <div className="mt-1 text-xs" style={{ color: COLORS.textMuted }}>{label}</div>
    </div>
  );
}

function StatusChip({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-2xl p-[15px] text-center" style={{ background: COLORS.card, boxShadow: CARD_SHADOW }}>
      <div className="text-[26px] font-extrabold tracking-tight" style={{ color }}>{value}</div>
      <div className="mt-1.5 text-xs" style={{ color: COLORS.textMuted }}>{label}</div>
    </div>
  );
}
