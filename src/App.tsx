import { MerchantPhone } from './components/MerchantPhone'
import { useMomoStore } from './store'

export default function App() {
  // Full-screen merchant back office, home layout fixed to variant A.
  // The language toggle lives inside the app's top-right corner.
  const store = useMomoStore('zh', 'a')

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MerchantPhone store={store} />
    </div>
  )
}
