'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_THEME, type MenuTheme } from './dashboard/lib/menu-design'

// The menu design (color / pattern / layout) the owner picks is saved here so
// the customer ordering page can render with it. Front-end only for now
// (localStorage); swap for a DB read/write when a backend is added.
const KEY = 'momo.menuTheme'
const EVT = 'momo:menuTheme'

export function loadTheme(): MenuTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return DEFAULT_THEME
    return { ...DEFAULT_THEME, ...(JSON.parse(raw) as Partial<MenuTheme>) }
  } catch {
    return DEFAULT_THEME
  }
}

export function saveTheme(theme: MenuTheme): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(theme))
    // Notify listeners in the same tab (the 'storage' event only fires cross-tab).
    window.dispatchEvent(new CustomEvent(EVT, { detail: theme }))
  } catch {
    // ignore (private mode / storage disabled)
  }
}

/**
 * Live menu theme for the customer page. SSR-safe: starts at the default to
 * keep hydration stable, then loads the saved theme and follows later changes
 * (same tab via a custom event, other tabs via the storage event).
 */
export function useMenuTheme(): MenuTheme {
  const [theme, setTheme] = useState<MenuTheme>(DEFAULT_THEME)
  useEffect(() => {
    setTheme(loadTheme())
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<MenuTheme>).detail
      setTheme(detail ?? loadTheme())
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setTheme(loadTheme())
    }
    window.addEventListener(EVT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVT, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  return theme
}
