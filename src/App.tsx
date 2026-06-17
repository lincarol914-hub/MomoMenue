import { CustomerPhone } from './components/CustomerPhone'
import { MerchantPhone } from './components/MerchantPhone'
import { useMomoStore } from './store'

export default function App() {
  // Simple query-param routing: ?table=01 opens the customer ordering page for
  // that table (this is what each table's QR code points to); otherwise we show
  // the merchant back office. Home layout is fixed to variant A.
  const table = new URLSearchParams(window.location.search).get('table')
  return table ? <CustomerApp table={table} /> : <MerchantApp />
}

function MerchantApp() {
  const store = useMomoStore('zh', 'a')
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MerchantPhone store={store} />
    </div>
  )
}

function CustomerApp({ table }: { table: string }) {
  const store = useMomoStore('zh', 'a', table)
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CustomerPhone store={store} />
    </div>
  )
}
