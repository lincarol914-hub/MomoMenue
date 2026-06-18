"use client";

import { DISHES } from "../../lib/menu-data";
import { Dict, Lang, dishName, categoryLabel } from "../../lib/i18n";
import { COLORS } from "../../lib/theme";
import {
  MenuTheme,
  THEME_COLORS,
  PATTERN_KEYS,
  LAYOUT_KEYS,
  PatternKey,
  LayoutKey,
  patternBackground,
} from "../../lib/menu-design";
import { DishIcon } from "./DishIcon";
import { Icon } from "./Icon";

export function MenuDesignScreen({
  t,
  lang,
  theme,
  onChange,
  onBack,
}: {
  t: Dict;
  lang: Lang;
  theme: MenuTheme;
  onChange: (next: Partial<MenuTheme>) => void;
  onBack: () => void;
}) {
  const dishes = DISHES.slice(0, 4).map((m) => ({
    name: dishName(lang, m),
    price: `¥${m.price}`,
    desc: categoryLabel(t, m.category),
    icon: m.icon,
  }));
  const pat = patternBackground(theme.pattern);
  const patLabel: Record<PatternKey, string> = { none: t.patNone, dots: t.patDots, stripes: t.patStripes, grid: t.patGrid };
  const layLabel: Record<LayoutKey, string> = { list: t.layList, card: t.layCard, grid: t.layGrid };

  return (
    <div className="pb-8 pt-1.5">
      <div className="flex items-center justify-between px-[22px] pb-4 pt-1">
        <button type="button" onClick={onBack} className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px]" style={{ background: COLORS.cardAlt, color: COLORS.brand }}>
          <Icon name="back" size={22} />
        </button>
        <div className="text-lg font-extrabold" style={{ color: COLORS.textStrong }}>{t.designTitle}</div>
        <button type="button" onClick={onBack} className="text-sm font-extrabold" style={{ color: "#97785F" }}>{t.save}</button>
      </div>

      {/* live preview */}
      <div className="px-[22px]">
        <div className="mb-2.5 text-[12.5px] font-bold" style={{ color: COLORS.textMuted }}>{t.dsCustomerView}</div>
        <div className="overflow-hidden rounded-[20px] border" style={{ borderColor: COLORS.hairline, boxShadow: "0 10px 26px -16px rgba(92,74,61,.4)" }}>
          <div className="relative overflow-hidden px-4 py-[18px]" style={{ background: theme.color }}>
            <div className="absolute inset-0" style={{ backgroundImage: pat.backgroundImage, backgroundSize: pat.backgroundSize }} />
            <div className="relative flex items-center gap-2.5">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl" style={{ background: COLORS.surface, color: theme.color }}>
                <DishIcon type="noodle" size={26} />
              </div>
              <div style={{ color: COLORS.surface }}>
                <div className="text-base font-extrabold">{t.restName}</div>
                <div className="mt-px text-[11px] opacity-85">{t.cWelcome}</div>
              </div>
            </div>
            <div className="relative mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ background: "rgba(255,249,243,.18)", color: COLORS.surface }}>
              <Icon name="pin" size={14} /> {t.cTable} A1
            </div>
          </div>

          <div className="p-3.5" style={{ background: COLORS.surface }}>
            {theme.layout === "list" && (
              <div className="flex flex-col gap-3">
                {dishes.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-xl" style={{ background: COLORS.cardAlt, color: "#A07E63" }}><DishIcon type={p.icon} size={26} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold" style={{ color: COLORS.textStrong }}>{p.name}</div>
                      <div className="mt-0.5 text-xs" style={{ color: COLORS.textMuted }}>{p.desc}</div>
                    </div>
                    <div className="flex-none text-sm font-extrabold" style={{ color: theme.color }}>{p.price}</div>
                  </div>
                ))}
              </div>
            )}

            {theme.layout === "card" && (
              <div className="flex flex-col gap-3.5">
                {dishes.slice(0, 2).map((p, i) => (
                  <div key={i} className="overflow-hidden rounded-[14px] border" style={{ borderColor: COLORS.hairline }}>
                    <div className="flex h-24 items-center justify-center" style={{ background: COLORS.cardAlt, color: "#A07E63" }}><DishIcon type={p.icon} size={40} /></div>
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <div className="text-[14.5px] font-bold" style={{ color: COLORS.textStrong }}>{p.name}</div>
                      <div className="text-sm font-extrabold" style={{ color: theme.color }}>{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {theme.layout === "grid" && (
              <div className="grid grid-cols-2 gap-2.5">
                {dishes.map((p, i) => (
                  <div key={i} className="overflow-hidden rounded-[13px] border" style={{ borderColor: COLORS.hairline }}>
                    <div className="flex h-[70px] items-center justify-center" style={{ background: COLORS.cardAlt, color: "#A07E63" }}><DishIcon type={p.icon} size={30} /></div>
                    <div className="px-2.5 py-2.5">
                      <div className="truncate text-[13px] font-bold" style={{ color: COLORS.textStrong }}>{p.name}</div>
                      <div className="mt-0.5 text-[13px] font-extrabold" style={{ color: theme.color }}>{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* theme color */}
      <h3 className="px-[22px] pb-3 pt-7 text-[15px] font-extrabold" style={{ color: COLORS.textStrong }}>{t.dsTheme}</h3>
      <div className="flex gap-3.5 px-[22px]">
        {THEME_COLORS.map((c) => {
          const on = theme.color === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ color: c })}
              className="flex h-11 w-11 items-center justify-center rounded-full transition-shadow"
              style={{ background: c, boxShadow: `0 0 0 3px ${COLORS.surface}, 0 0 0 ${on ? "5px" : "0px"} ${on ? COLORS.brandDeep : "transparent"}` }}
            >
              {on && (
                <svg viewBox="0 0 48 48" width={16} height={16} fill="none" stroke={COLORS.surface} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M14 25l7 7 14-15" /></svg>
              )}
            </button>
          );
        })}
      </div>

      {/* pattern */}
      <h3 className="px-[22px] pb-3 pt-7 text-[15px] font-extrabold" style={{ color: COLORS.textStrong }}>{t.dsPattern}</h3>
      <div className="flex gap-2.5 px-[22px]">
        {PATTERN_KEYS.map((k) => {
          const on = theme.pattern === k;
          const bg = patternBackground(k);
          return (
            <button key={k} type="button" onClick={() => onChange({ pattern: k })} className="flex-1">
              <div className="relative h-[54px] overflow-hidden rounded-[13px] border-2" style={{ background: theme.color, borderColor: on ? "#97785F" : "transparent" }}>
                <div className="absolute inset-0" style={{ backgroundImage: bg.backgroundImage, backgroundSize: bg.backgroundSize }} />
              </div>
              <div className="mt-1.5 text-center text-xs font-bold" style={{ color: on ? COLORS.textStrong : COLORS.textMuted }}>{patLabel[k]}</div>
            </button>
          );
        })}
      </div>

      {/* layout */}
      <h3 className="px-[22px] pb-3 pt-7 text-[15px] font-extrabold" style={{ color: COLORS.textStrong }}>{t.dsLayout}</h3>
      <div className="flex gap-2.5 px-[22px]">
        {LAYOUT_KEYS.map((k) => {
          const on = theme.layout === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange({ layout: k })}
              className="flex flex-1 flex-col items-center gap-2.5 rounded-[14px] border-2 px-2 py-3.5"
              style={{ background: on ? COLORS.cardAlt : COLORS.card, borderColor: on ? "#97785F" : COLORS.hairline }}
            >
              <LayoutGlyph kind={k} color={on ? "#97785F" : "#B8A593"} />
              <span className="text-[12.5px] font-bold" style={{ color: on ? COLORS.textStrong : COLORS.textMuted }}>{layLabel[k]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LayoutGlyph({ kind, color }: { kind: LayoutKey; color: string }) {
  const c = { viewBox: "0 0 48 48", width: 24, height: 24, fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "list")
    return (<svg {...c}><circle cx="11" cy="16" r="1.6" /><circle cx="11" cy="24" r="1.6" /><circle cx="11" cy="32" r="1.6" /><path d="M18 16h20M18 24h20M18 32h14" /></svg>);
  if (kind === "card")
    return (<svg {...c}><rect x="9" y="11" width="30" height="26" rx="4" /><path d="M9 29l7-6 5 4 6-5 12 9" /><circle cx="16" cy="19" r="2.2" /></svg>);
  return (<svg {...c}><rect x="7" y="7" width="15" height="15" rx="3" /><rect x="26" y="7" width="15" height="15" rx="3" /><rect x="7" y="26" width="15" height="15" rx="3" /><rect x="26" y="26" width="15" height="15" rx="3" /></svg>);
}
