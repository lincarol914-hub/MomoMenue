'use client'

import { useEffect, useState } from 'react'
import { MerchantApp } from './MerchantApp'
import { OnboardingPhone } from './components/OnboardingPhone'
import { hasOnboarded } from './onboarding-state'

/**
 * Default landing for `/`. First-time visitors see onboarding; once it has been
 * completed (remembered in localStorage) returning users go straight to the
 * back-office dashboard. The decision needs the browser, so we render a neutral
 * background on the server / first paint to avoid a hydration mismatch.
 */
export function MerchantEntry() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null)
  useEffect(() => setOnboarded(hasOnboarded()), [])

  if (onboarded === null) {
    return <div style={{ width: '100%', height: '100%', background: '#ECE3D8' }} />
  }
  if (onboarded) {
    return <MerchantApp initialScreen="home" />
  }
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <OnboardingPhone />
    </div>
  )
}
