// Pure analytics layer — no React, no styling. Feed it dishes, get back
// the numbers the dashboard renders. Swap computeAnalytics' input for your
// real order data and every chart updates automatically.

import { Dish, DISHES, Category } from "./menu-data";

export type RangeKey = "today" | "week" | "month";

/**
 * Demo scaling so the range tabs feel alive off a single `sold` figure.
 * In production, pass already-bucketed order data per range instead.
 */
const RANGE_FACTOR: Record<RangeKey, number> = {
  today: 0.05,
  week: 0.32,
  month: 1,
};

export const CATEGORY_COLORS: Record<Category, string> = {
  hot: "#C0703F",
  staple: "#C99A6E",
  cold: "#7E9A8F",
  soup: "#9A8FB0",
  drink: "#D8B08C",
};

export interface DishStat {
  id: string;
  nameZh: string;
  nameEn: string;
  sold: number;
  /** 0–100, share of the top seller for bar width */
  barPct: number;
  icon: Dish["icon"];
  rank: number;
}

export interface CategoryStat {
  category: Category;
  sold: number;
  /** 0–100 share of total */
  pct: number;
  color: string;
}

export interface PeakBucket {
  label: string;
  /** 0–100 relative height */
  intensity: number;
  isPeak: boolean;
}

export interface Analytics {
  orders: number;
  revenue: number;
  avgTicket: number;
  topDishes: DishStat[];
  categoryMix: CategoryStat[];
  peakHours: PeakBucket[];
  /** the most popular dish + its share, for the headline insight */
  topDishId: string;
  topDishShare: number;
}

// Static demand curve: lunch + dinner peaks. Heights are relative.
const PEAK_PATTERN: ReadonlyArray<readonly [string, number]> = [
  ["09–11", 18],
  ["11–13", 92],
  ["13–15", 42],
  ["15–17", 24],
  ["17–19", 100],
  ["19–21", 66],
];

export function computeAnalytics(
  range: RangeKey,
  dishes: Dish[] = DISHES,
): Analytics {
  const factor = RANGE_FACTOR[range] ?? 1;

  const scaled = dishes.map((d) => ({
    dish: d,
    sold: Math.max(1, Math.round(d.sold * factor)),
  }));

  const totalSold = scaled.reduce((sum, s) => sum + s.sold, 0);
  const revenue = scaled.reduce((sum, s) => sum + s.sold * s.dish.price, 0);
  const orders = Math.max(1, Math.round(totalSold / 2.4));
  const avgTicket = Math.round(revenue / orders);

  const sorted = [...scaled].sort((a, b) => b.sold - a.sold);
  const maxSold = sorted[0]?.sold ?? 1;

  const topDishes: DishStat[] = sorted.slice(0, 5).map((s, i) => ({
    id: s.dish.id,
    nameZh: s.dish.nameZh,
    nameEn: s.dish.nameEn,
    sold: s.sold,
    barPct: Math.round((s.sold / maxSold) * 100),
    icon: s.dish.icon,
    rank: i + 1,
  }));

  const byCategory = new Map<Category, number>();
  for (const s of scaled) {
    byCategory.set(s.dish.category, (byCategory.get(s.dish.category) ?? 0) + s.sold);
  }
  const categoryMix: CategoryStat[] = [...byCategory.entries()]
    .map(([category, sold]) => ({
      category,
      sold,
      pct: Math.round((sold / totalSold) * 100),
      color: CATEGORY_COLORS[category],
    }))
    .sort((a, b) => b.sold - a.sold);

  const peakHours: PeakBucket[] = PEAK_PATTERN.map(([label, intensity]) => ({
    label,
    intensity,
    isPeak: intensity >= 90,
  }));

  const top = sorted[0];
  return {
    orders,
    revenue,
    avgTicket,
    topDishes,
    categoryMix,
    peakHours,
    topDishId: top?.dish.id ?? "",
    topDishShare: top ? Math.round((top.sold / totalSold) * 100) : 0,
  };
}

// ---- Business Overview ----

export interface TrendBar {
  /** 0–100 relative height */
  intensity: number;
  isPeak: boolean;
}

export interface Overview {
  revenue: number;
  orders: number;
  avgTicket: number;
  /** revenue change vs previous period, e.g. "+18%" */
  trendPct: string;
  /** average seatings per table, e.g. "2.4" */
  turnover: string;
  /** occupancy rate, e.g. "75%" */
  occupancy: string;
  /** 7-day revenue trend */
  trend: TrendBar[];
}

const TREND_PATTERN = [58, 66, 52, 78, 70, 92, 100];
const TREND_BY_RANGE: Record<RangeKey, { trendPct: string; turnover: string; occupancy: string }> = {
  today: { trendPct: "+12%", turnover: "1.8", occupancy: "68%" },
  week: { trendPct: "+18%", turnover: "2.4", occupancy: "75%" },
  month: { trendPct: "+9%", turnover: "2.6", occupancy: "71%" },
};

export function computeOverview(range: RangeKey, dishes: Dish[] = DISHES): Overview {
  const a = computeAnalytics(range, dishes);
  const meta = TREND_BY_RANGE[range] ?? TREND_BY_RANGE.week;
  return {
    revenue: a.revenue,
    orders: a.orders,
    avgTicket: a.avgTicket,
    trendPct: meta.trendPct,
    turnover: meta.turnover,
    occupancy: meta.occupancy,
    trend: TREND_PATTERN.map((intensity) => ({ intensity, isPeak: intensity >= 92 })),
  };
}
