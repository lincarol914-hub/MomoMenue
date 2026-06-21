'use client'

import type { Dish } from './data'
import type { MenuTheme } from './dashboard/lib/menu-design'

// The published menu shared between the merchant and every customer phone.
export interface MenuSnapshot {
  v: 1
  theme: MenuTheme
  dishes: Dish[]
  /** dish ids the merchant turned off (hidden from customers) */
  off: string[]
  updatedAt: number
}

/** Read the currently published menu, or null if none / not configured. */
export async function fetchSnapshot(): Promise<MenuSnapshot | null> {
  try {
    const res = await fetch('/api/menu-state', { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { snapshot?: MenuSnapshot | null }
    return data?.snapshot ?? null
  } catch {
    return null
  }
}

/** Publish the menu (merchant only). Returns true when stored in the cloud. */
export async function publishSnapshot(snap: Omit<MenuSnapshot, 'v' | 'updatedAt'>): Promise<boolean> {
  try {
    const body: MenuSnapshot = { v: 1, updatedAt: Date.now(), ...snap }
    const res = await fetch('/api/menu-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
    return Boolean(data?.ok)
  } catch {
    return false
  }
}

/** ids turned off → from an itemOn map (true/absent = on). */
export function offIds(itemOn: Record<string, boolean>): string[] {
  return Object.keys(itemOn).filter((id) => itemOn[id] === false)
}
