'use client'

import { MerchantPhone } from './components/MerchantPhone'
import { useMomoStore } from './store'

/** Full-screen merchant back office, home layout fixed to variant A. */
export function MerchantApp() {
  const store = useMomoStore('zh', 'a')
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MerchantPhone store={store} />
    </div>
  )
}
