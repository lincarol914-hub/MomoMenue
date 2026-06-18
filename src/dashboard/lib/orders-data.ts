// Demo orders — feed your real order data here. Used by HomeScreen (recent
// list) and OverviewScreen (status counts).

export type OrderStatus = "new" | "making" | "done";

export interface OrderItem {
  nameZh: string;
  nameEn: string;
  qty: number;
}

export interface Order {
  id: string;
  table: string;
  items: OrderItem[];
  time: string;
  status: OrderStatus;
}

export const DEMO_ORDERS: Order[] = [
  { id: "o1", table: "A2", time: "09:41", status: "new", items: [
    { nameZh: "牛肉面", nameEn: "Beef Noodles", qty: 2 },
    { nameZh: "凉拌黄瓜", nameEn: "Cucumber", qty: 1 },
  ] },
  { id: "o2", table: "B1", time: "09:40", status: "making", items: [
    { nameZh: "宫保鸡丁", nameEn: "Kung Pao Chicken", qty: 1 },
    { nameZh: "米饭", nameEn: "Rice", qty: 2 },
  ] },
  { id: "o3", table: "C3", time: "09:30", status: "new", items: [
    { nameZh: "番茄鸡蛋面", nameEn: "Tomato Noodles", qty: 1 },
    { nameZh: "可乐", nameEn: "Cola", qty: 1 },
  ] },
  { id: "o4", table: "A1", time: "09:38", status: "done", items: [
    { nameZh: "小笼包", nameEn: "Soup Dumplings", qty: 1 },
    { nameZh: "柠檬茶", nameEn: "Lemon Tea", qty: 1 },
  ] },
];

export function statusCounts(orders: Order[] = DEMO_ORDERS) {
  return {
    new: orders.filter((o) => o.status === "new").length,
    making: orders.filter((o) => o.status === "making").length,
    done: orders.filter((o) => o.status === "done").length,
  };
}
