import { useMemo, useState } from 'react'
import {
  DICTS, INITIAL_ORDERS, INITIAL_TABLES, MENU,
  type CartLine, type CatKey, type Dict, type Lang, type Order, type Table, type Variant,
} from './data'

export type MScreen = 'welcome' | 'login' | 'home' | 'menu' | 'addDish' | 'qr' | 'orders' | 'settings'
export type MTab = 'home' | 'orders' | 'menu' | 'settings'
export type AddMethod = 'manual' | 'file' | 'photo'
export type OrderFilter = 'all' | 'new' | 'making' | 'done'
export type CScreen = 'menu' | 'detail' | 'cart' | 'success'

export interface State {
  lang: Lang
  variant: Variant
  mScreen: MScreen
  mTab: MTab
  addMethod: AddMethod
  menuCat: CatKey
  orderFilter: OrderFilter
  itemOn: Record<string, boolean>
  cScreen: CScreen
  cCat: Exclude<CatKey, 'all'>
  detailId: string | null
  detailQty: number
  cart: CartLine[]
  lastOrderId: string | null
  orders: Order[]
  /** the table the customer is seated at (from the scanned ?table= URL) */
  table: string
  /** restaurant tables managed in the merchant back office */
  tables: Table[]
}

function initialState(lang: Lang, variant: Variant, table: string): State {
  return {
    lang,
    variant,
    mScreen: 'welcome',
    mTab: 'home',
    addMethod: 'manual',
    menuCat: 'all',
    orderFilter: 'all',
    itemOn: {},
    cScreen: 'menu',
    cCat: 'hot',
    detailId: null,
    detailQty: 1,
    cart: [],
    lastOrderId: null,
    orders: INITIAL_ORDERS,
    table,
    tables: INITIAL_TABLES,
  }
}

export interface Store {
  s: State
  d: Dict
  /** language-pick helper */
  L: (zh: string, en: string) => string
  /** dish name in the active language */
  nm: (it: { zh: string; en: string }) => string
  find: (id: string) => (typeof MENU)[number] | undefined
  isOn: (id: string) => boolean

  // merchant navigation
  goWelcome: () => void
  goLogin: () => void
  doLogin: () => void
  goHome: () => void
  goMenu: () => void
  goAddDish: () => void
  goQr: () => void
  goOrders: () => void
  goSettings: () => void
  setAddMethod: (m: AddMethod) => void
  toggleLang: () => void
  toggleVariant: () => void
  setMenuCat: (k: CatKey) => void
  setOrderFilter: (k: OrderFilter) => void
  toggleItem: (id: string) => void
  advance: (id: string) => void
  addTable: () => void

  // customer flow
  setCustCat: (k: Exclude<CatKey, 'all'>) => void
  openDetail: (id: string) => void
  cBackMenu: () => void
  detailInc: () => void
  detailDec: () => void
  addToCart: (id: string, qty?: number) => void
  incCart: (id: string) => void
  decCart: (id: string) => void
  goCart: () => void
  submitOrder: () => void
}

export function useMomoStore(lang: Lang, variant: Variant, table = 'A1'): Store {
  const [s, setS] = useState<State>(() => initialState(lang, variant, table))
  const find = (id: string) => MENU.find((m) => m.id === id)

  return useMemo<Store>(() => {
    const L = (zh: string, en: string) => (s.lang === 'zh' ? zh : en)
    return {
      s,
      d: DICTS[s.lang],
      L,
      nm: (it) => (s.lang === 'zh' ? it.zh : it.en),
      find,
      isOn: (id) => s.itemOn[id] !== false,

      goWelcome: () => setS((p) => ({ ...p, mScreen: 'welcome' })),
      goLogin: () => setS((p) => ({ ...p, mScreen: 'login' })),
      doLogin: () => setS((p) => ({ ...p, mScreen: 'home', mTab: 'home' })),
      goHome: () => setS((p) => ({ ...p, mScreen: 'home', mTab: 'home' })),
      goMenu: () => setS((p) => ({ ...p, mScreen: 'menu', mTab: 'menu' })),
      goAddDish: () => setS((p) => ({ ...p, mScreen: 'addDish', addMethod: 'manual' })),
      goQr: () => setS((p) => ({ ...p, mScreen: 'qr', mTab: 'home' })),
      goOrders: () => setS((p) => ({ ...p, mScreen: 'orders', mTab: 'orders' })),
      goSettings: () => setS((p) => ({ ...p, mScreen: 'settings', mTab: 'settings' })),
      setAddMethod: (m) => setS((p) => ({ ...p, addMethod: m })),
      toggleLang: () => setS((p) => ({ ...p, lang: p.lang === 'zh' ? 'en' : 'zh' })),
      toggleVariant: () => setS((p) => ({ ...p, variant: p.variant === 'a' ? 'b' : 'a' })),
      setMenuCat: (k) => setS((p) => ({ ...p, menuCat: k })),
      setOrderFilter: (k) => setS((p) => ({ ...p, orderFilter: k })),
      toggleItem: (id) => setS((p) => ({ ...p, itemOn: { ...p.itemOn, [id]: p.itemOn[id] === false ? true : false } })),
      advance: (id) =>
        setS((p) => ({
          ...p,
          orders: p.orders.map((o) => (o.id === id ? { ...o, status: o.status === 'new' ? 'making' : 'done' } : o)),
        })),
      addTable: () =>
        setS((p) => {
          let n = p.tables.length + 1
          const has = (id: string) => p.tables.some((t) => t.id === id)
          let id = String(n).padStart(2, '0')
          while (has(id)) id = String(++n).padStart(2, '0')
          return { ...p, tables: [...p.tables, { id, name: id, seats: 'seats4', status: 'idle' }] }
        }),

      setCustCat: (k) => setS((p) => ({ ...p, cCat: k })),
      openDetail: (id) => setS((p) => ({ ...p, cScreen: 'detail', detailId: id, detailQty: 1 })),
      cBackMenu: () => setS((p) => ({ ...p, cScreen: 'menu' })),
      detailInc: () => setS((p) => ({ ...p, detailQty: p.detailQty + 1 })),
      detailDec: () => setS((p) => ({ ...p, detailQty: Math.max(1, p.detailQty - 1) })),
      addToCart: (id, qty) =>
        setS((p) => {
          const c = p.cart.map((x) => ({ ...x }))
          const i = c.findIndex((x) => x.id === id)
          if (i >= 0) c[i].qty += qty ?? 1
          else c.push({ id, qty: qty ?? 1 })
          return { ...p, cart: c, cScreen: 'menu' }
        }),
      incCart: (id) => setS((p) => ({ ...p, cart: p.cart.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) })),
      decCart: (id) =>
        setS((p) => ({
          ...p,
          cart: p.cart.flatMap((x) => (x.id === id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x])),
        })),
      goCart: () => setS((p) => ({ ...p, cScreen: 'cart' })),
      submitOrder: () =>
        setS((p) => {
          if (!p.cart.length) return p
          const items = p.cart.map((ci) => {
            const m = find(ci.id)!
            return [m.zh, m.en, ci.qty] as Order['items'][number]
          })
          const id = 'oC' + Date.now()
          const order: Order = { id, table: p.table, items, note: ['', ''], time: '09:42', status: 'new' }
          return { ...p, orders: [order, ...p.orders], cart: [], cScreen: 'success', lastOrderId: id }
        }),
    }
  }, [s])
}
