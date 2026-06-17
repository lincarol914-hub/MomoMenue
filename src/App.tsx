import { MerchantPhone } from './components/MerchantPhone'
import { useMomoStore } from './store'

export default function App() {
  // Merchant back office only, home layout fixed to variant A.
  const store = useMomoStore('zh', 'a')
  const { s, d } = store

  const seg = (label: string, active: boolean) => (
    <div style={{ padding: '6px 14px', borderRadius: 9, background: active ? '#8B6E5C' : 'transparent', color: active ? '#FFF9F3' : '#A1887F' }}>{label}</div>
  )

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '56px 24px 80px', background: '#ECE3D8', fontFamily: "'Baloo 2','Noto Sans SC',-apple-system,sans-serif", display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 392 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 34 }}>
          <div>
            <img src="assets/logo-word.png" alt="MomoMenu" style={{ height: 46, display: 'block' }} />
            <div style={{ fontSize: 14, color: '#A1887F', marginTop: 11, marginLeft: 2 }}>{d.tagline}</div>
          </div>
          <div onClick={store.toggleLang} style={{ display: 'flex', background: '#FFF9F3', borderRadius: 13, padding: 4, boxShadow: '0 2px 6px rgba(139,110,92,.12)', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            {seg('中文', s.lang === 'zh')}
            {seg('EN', s.lang === 'en')}
          </div>
        </div>

        <MerchantPhone store={store} />
      </div>
    </div>
  )
}
