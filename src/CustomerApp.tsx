'use client'

import { CustomerPhone } from './components/CustomerPhone'
import { useMomoStore } from './store'

/** Full-screen customer ordering page, pre-set to the scanned table. */
export function CustomerApp({ table }: { table: string }) {
  const store = useMomoStore('zh', 'a', table)
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CustomerPhone store={store} />
    </div>
  )
}
