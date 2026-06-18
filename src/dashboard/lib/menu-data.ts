// Dish catalog + types. Replace DISHES with a fetch from your own API/DB —
// computeAnalytics() in ./analytics.ts only needs an array of Dish.

export type Category = "hot" | "cold" | "staple" | "soup" | "drink";

export type DishIcon =
  | "noodle"
  | "chicken"
  | "rice"
  | "veg"
  | "bun"
  | "soup"
  | "drink";

export interface Dish {
  id: string;
  nameZh: string;
  nameEn: string;
  price: number;
  /** lifetime / monthly units sold — the popularity signal */
  sold: number;
  category: Category;
  icon: DishIcon;
}

export const DISHES: Dish[] = [
  { id: "m1", nameZh: "招牌牛肉面", nameEn: "Signature Beef Noodles", price: 28, sold: 128, category: "hot", icon: "noodle" },
  { id: "m2", nameZh: "宫保鸡丁", nameEn: "Kung Pao Chicken", price: 32, sold: 88, category: "hot", icon: "chicken" },
  { id: "m3", nameZh: "番茄鸡蛋面", nameEn: "Tomato Egg Noodles", price: 22, sold: 96, category: "staple", icon: "noodle" },
  { id: "m4", nameZh: "红烧牛肉饭", nameEn: "Braised Beef Rice", price: 32, sold: 75, category: "staple", icon: "rice" },
  { id: "m5", nameZh: "凉拌黄瓜", nameEn: "Smashed Cucumber", price: 16, sold: 53, category: "cold", icon: "veg" },
  { id: "m6", nameZh: "小笼包", nameEn: "Soup Dumplings", price: 18, sold: 64, category: "staple", icon: "bun" },
  { id: "m7", nameZh: "西红柿蛋汤", nameEn: "Tomato Egg Soup", price: 18, sold: 46, category: "soup", icon: "soup" },
  { id: "m8", nameZh: "柠檬茶", nameEn: "Lemon Tea", price: 16, sold: 88, category: "drink", icon: "drink" },
];
