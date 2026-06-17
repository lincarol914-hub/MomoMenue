'use client'

const KEY = 'momomenu_onboarded'

/** Whether this browser has completed onboarding before. */
export function hasOnboarded(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** Remember that onboarding is done so it is not shown again. */
export function markOnboarded(): void {
  try {
    window.localStorage.setItem(KEY, '1')
  } catch {
    // ignore (private mode / storage disabled)
  }
}
