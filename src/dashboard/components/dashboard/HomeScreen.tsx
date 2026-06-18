import { Dict, Lang, dishName } from "../../lib/i18n";
import { COLORS, CARD_SHADOW } from "../../lib/theme";
import { computeAnalytics } from "../../lib/analytics";
import { DEMO_ORDERS, statusCounts } from "../../lib/orders-data";
import { Icon, IconName } from "./Icon";
import type { ScreenKey } from "./BottomNav";

const STATUS_LABEL: Record<string, keyof Dict> = {
  new: "sNew",
  making: "sMaking",
  done: "sDone",
};

export function HomeScreen({
  t,
  lang,
  onNavigate,
}: {
  t: Dict;
  lang: Lang;
  onNavigate: (s: ScreenKey | "qr") => void;
}) {
  const a = computeAnalytics("week");
  const counts = statusCounts();
  const yuan = (n: number) => `¥${n.toLocaleString()}`;

  const quick: { key: ScreenKey | "qr"; icon: IconName; label: string }[] = [
    { key: "design", icon: "design", label: t.designEntry },
    { key: "qr", icon: "qr", label: t.qrEntry },
    { key: "overview", icon: "overview", label: t.ovEntry },
    { key: "stats", icon: "stats", label: t.statsEntry },
  ];

  return (
    <div className="px-[22px] pb-8 pt-1.5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: COLORS.textStrong }}>
            {t.greeting} 👋
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.textMuted }}>{t.greetingSub}</p>
        </div>
      </div>

      {/* today overview */}
      <div className="mt-5 rounded-[22px] p-[18px]" style={{ background: COLORS.card, boxShadow: CARD_SHADOW }}>
        <div className="mb-3.5 text-[15px] font-extrabold" style={{ color: COLORS.textStrong }}>{t.todayOverview}</div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl p-[15px]" style={{ background: COLORS.brand }}>
            <div className="text-[26px] font-extrabold tracking-tight" style={{ color: COLORS.surface }}>{yuan(a.revenue)}</div>
            <div className="mt-1 text-xs" style={{ color: "#E7D8CA" }}>{t.revenue}</div>
          </div>
          <Tile value={String(a.orders)} label={t.validOrders} />
          <Tile value="6" label={t.tablesInUse} />
          <Tile value={String(counts.new + counts.making)} label={t.pendingOrders} accent />
        </div>
      </div>

      {/* quick actions */}
      <div className="mb-3.5 mt-7 text-[17px] font-extrabold" style={{ color: COLORS.textStrong }}>{t.quick}</div>
      <div className="grid grid-cols-2 gap-2.5">
        {quick.map((q) => (
          <button
            key={q.key}
            type="button"
            onClick={() => onNavigate(q.key)}
            className="flex items-center gap-3 rounded-[18px] p-4 text-left"
            style={{ background: COLORS.card, boxShadow: CARD_SHADOW }}
          >
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[13px]" style={{ background: COLORS.cardAlt, color: COLORS.brand }}>
              <Icon name={q.icon} size={24} />
            </span>
            <span className="text-[15px] font-bold" style={{ color: COLORS.textStrong }}>{q.label}</span>
          </button>
        ))}
      </div>

      {/* recent orders */}
      <div className="mb-3.5 mt-7 flex items-center justify-between">
        <div className="text-[17px] font-extrabold" style={{ color: COLORS.textStrong }}>{t.liveOrders}</div>
        <div className="text-[13px] font-semibold" style={{ color: COLORS.textMuted }}>{t.viewAll} ›</div>
      </div>
      <div className="flex flex-col gap-2.5">
        {DEMO_ORDERS.slice(0, 3).map((o) => (
          <div key={o.id} className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: COLORS.card, boxShadow: CARD_SHADOW }}>
            <div className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl text-sm font-extrabold" style={{ background: COLORS.cardAlt, color: COLORS.brand }}>{o.table}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold" style={{ color: COLORS.textStrong }}>{lang === "zh" ? `桌号 ${o.table}` : `Table ${o.table}`}</div>
              <div className="mt-0.5 truncate text-[12.5px]" style={{ color: COLORS.textMuted }}>
                {o.items.map((it) => `${it.qty}× ${dishName(lang, it)}`).join(lang === "zh" ? "、" : ", ")}
              </div>
            </div>
            <div className="flex-none text-right">
              <div className="text-xs" style={{ color: COLORS.textFaint }}>{o.time}</div>
              <div className="mt-1 rounded-lg px-2 py-0.5 text-xs font-bold" style={{ color: COLORS.accent, background: COLORS.accentSoft }}>{t[STATUS_LABEL[o.status]]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tile({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-[15px]" style={{ background: COLORS.cardAlt }}>
      <div className="text-[26px] font-extrabold tracking-tight" style={{ color: accent ? COLORS.accent : COLORS.textStrong }}>{value}</div>
      <div className="mt-1 text-xs" style={{ color: COLORS.textMuted }}>{label}</div>
    </div>
  );
}
