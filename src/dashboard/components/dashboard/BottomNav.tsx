"use client";

import { Dict } from "../../lib/i18n";
import { COLORS } from "../../lib/theme";
import { Icon, IconName } from "./Icon";

export type ScreenKey = "home" | "overview" | "stats" | "design";

const ITEMS: { key: ScreenKey; icon: IconName; labelKey: keyof Dict }[] = [
  { key: "home", icon: "home", labelKey: "navHome" },
  { key: "overview", icon: "overview", labelKey: "navOverview" },
  { key: "stats", icon: "stats", labelKey: "navStats" },
  { key: "design", icon: "design", labelKey: "navDesign" },
];

export function BottomNav({
  active,
  onNavigate,
  t,
}: {
  active: ScreenKey;
  onNavigate: (s: ScreenKey) => void;
  t: Dict;
}) {
  return (
    <nav
      className="flex border-t"
      style={{ borderColor: COLORS.hairline, background: COLORS.card }}
    >
      {ITEMS.map((it) => {
        const on = it.key === active;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onNavigate(it.key)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
            style={{ color: on ? COLORS.brand : "#C9B8A6" }}
          >
            <Icon name={it.icon} size={23} />
            <span className="text-[11px] font-semibold">{t[it.labelKey]}</span>
          </button>
        );
      })}
    </nav>
  );
}
