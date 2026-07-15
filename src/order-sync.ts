'use client'

import type { Order } from './data'

// Client helpers for the shared cloud order store (/api/orders).
// All of them fail soft: with KV unconfigured or offline they return
// empty/false and the app keeps working on local in-memory state.

/** All orders (merchant polling). */
export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders', { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { orders?: Order[] }
    return Array.isArray(data?.orders) ? data.orders : []
  } catch {
    return []
  }
}

/** One order by id (customer order-status tracking). */
export async function fetchOrder(id: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { orders?: Order[] }
    return data?.orders?.[0] ?? null
  } catch {
    return null
  }
}

/** Store a new order, or an updated copy after a status change. */
export async function pushOrder(order: Order): Promise<boolean> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
    return Boolean(data?.ok)
  } catch {
    return false
  }
}
