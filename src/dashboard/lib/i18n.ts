// Minimal bilingual dictionary covering Home, Overview, Stats and Menu Design.
// If your project already uses next-intl / react-i18next, move these keys into
// your catalog and delete this file.

import type { Category } from "./menu-data";

export type Lang = "zh" | "en";

export const DICT = {
  zh: {
    // app / nav
    appTagline: "扫码点餐 · 后台接单 · 轻松经营",
    navHome: "首页",
    navOverview: "概览",
    navStats: "统计",
    navDesign: "设计",
    restName: "Momo小馆",

    // home
    greeting: "下午好，店长",
    greetingSub: "今天是美好的一天，生意加油呀！",
    todayOverview: "今日营业概览",
    quick: "快捷功能",
    liveOrders: "最近订单",
    viewAll: "查看全部",
    designEntry: "菜单设计",
    qrEntry: "桌台二维码",
    ovEntry: "营业概览",
    statsEntry: "数据统计",

    // ranges + KPIs
    today: "今日",
    week: "本周",
    month: "本月",
    revenue: "营业额",
    orders: "订单数",
    avgTicket: "客单价",
    validOrders: "有效订单",
    tablesInUse: "桌台使用中",
    pendingOrders: "待处理订单",

    // overview
    ovTitle: "营业概览",
    ovTurnover: "桌台周转",
    ovOccupancy: "上座率",
    ovTrend: "营业额趋势（近 7 天）",
    ovOrderStatus: "订单状态",
    sNew: "待接单",
    sMaking: "制作中",
    sDone: "已完成",

    // stats
    statsTitle: "数据统计",
    topDishes: "热销菜品 TOP 5",
    sold: "售出",
    unit: "份",
    categoryMix: "品类销量占比",
    peakHours: "下单时段分布",
    insightMid: "最受欢迎，占总销量",
    insightTail: "",

    // menu design
    designTitle: "菜单设计",
    dsCustomerView: "顾客看到的菜单",
    dsTheme: "主题颜色",
    dsPattern: "背景图案",
    dsLayout: "展示风格",
    save: "保存",
    patNone: "无",
    patDots: "圆点",
    patStripes: "斜纹",
    patGrid: "网格",
    layList: "列表",
    layCard: "大图卡片",
    layGrid: "双列网格",
    cWelcome: "欢迎光临，扫码点餐",
    cTable: "桌号",

    // categories
    catHot: "招牌推荐",
    catCold: "凉菜",
    catStaple: "主食",
    catSoup: "汤品",
    catDrink: "饮品",
  },
  en: {
    appTagline: "Scan · Receive · Run with ease",
    navHome: "Home",
    navOverview: "Overview",
    navStats: "Stats",
    navDesign: "Design",
    restName: "Momo Diner",

    greeting: "Good afternoon, boss",
    greetingSub: "It is a lovely day — good luck with business!",
    todayOverview: "Today at a glance",
    quick: "Quick actions",
    liveOrders: "Recent orders",
    viewAll: "View all",
    designEntry: "Menu Design",
    qrEntry: "Table QR",
    ovEntry: "Overview",
    statsEntry: "Statistics",

    today: "Today",
    week: "Week",
    month: "Month",
    revenue: "Revenue",
    orders: "Orders",
    avgTicket: "Avg / order",
    validOrders: "Valid orders",
    tablesInUse: "Tables in use",
    pendingOrders: "Pending orders",

    ovTitle: "Business Overview",
    ovTurnover: "Table turnover",
    ovOccupancy: "Occupancy",
    ovTrend: "Revenue trend (7 days)",
    ovOrderStatus: "Order status",
    sNew: "New",
    sMaking: "Cooking",
    sDone: "Done",

    statsTitle: "Statistics",
    topDishes: "Top 5 Dishes",
    sold: "sold",
    unit: "",
    categoryMix: "Category sales mix",
    peakHours: "Orders by hour",
    insightMid: "is the favorite —",
    insightTail: "of all dishes sold",

    designTitle: "Menu Design",
    dsCustomerView: "What guests see",
    dsTheme: "Theme color",
    dsPattern: "Background pattern",
    dsLayout: "Display style",
    save: "Save",
    patNone: "None",
    patDots: "Dots",
    patStripes: "Stripes",
    patGrid: "Grid",
    layList: "List",
    layCard: "Big cards",
    layGrid: "2-column",
    cWelcome: "Welcome — scan to order",
    cTable: "Table",

    catHot: "Recommended",
    catCold: "Cold",
    catStaple: "Staples",
    catSoup: "Soups",
    catDrink: "Drinks",
  },
} as const;

export type Dict = { [K in keyof (typeof DICT)["zh"]]: string };

export function categoryLabel(t: Dict, c: Category): string {
  return { hot: t.catHot, cold: t.catCold, staple: t.catStaple, soup: t.catSoup, drink: t.catDrink }[c];
}

export function dishName(lang: Lang, d: { nameZh: string; nameEn: string }): string {
  return lang === "zh" ? d.nameZh : d.nameEn;
}
