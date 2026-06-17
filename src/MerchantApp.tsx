'use client'

import { MerchantPhone } from './components/MerchantPhone'
import { useMomoStore, type MScreen } from './store'

/** Full-screen merchant back office, home layout fixed to variant A. */
export function MerchantApp({ initialScreen = 'welcome' }: { initialScreen?: MScreen }) {
  const store = useMomoStore('zh', 'a', 'A1', initialScreen)
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MerchantPhone store={store} />
    </div>
  )
}
