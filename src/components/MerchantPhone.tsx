import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import { CAT_KEYS, catLabel, type CatKey, type Order, type OrderStatus } from '../data'
import type { Store } from '../store'
import { appBaseUrl, downloadAllQr, downloadTableQr, tableLink } from '../qr-export'
import { extractMenu, toDish, type ExtractedDish } from '../menu-extract'
import { DICT } from '../dashboard/lib/i18n'
import type { RangeKey } from '../dashboard/lib/analytics'
import { DEFAULT_THEME, type MenuTheme } from '../dashboard/lib/menu-design'
import { loadTheme, saveTheme } from '../menu-theme'
import { fetchSnapshot, publishSnapshot, offIds } from '../menu-sync'
import { fetchOrders } from '../order-sync'
import type { ScreenKey } from '../dashboard/components/dashboard/BottomNav'
import type { Dict as DashDict } from '../dashboard/lib/i18n'
import { OverviewScreen } from '../dashboard/components/dashboard/OverviewScreen'
import { StatsScreen } from '../dashboard/components/dashboard/StatsScreen'
import { MenuDesignScreen } from '../dashboard/components/dashboard/MenuDesignScreen'
import { Icon } from './Icon'
import { PhoneFrame } from './PhoneFrame'
import { QrCode } from './QrCode'

const STATUS_COLOR: Record<OrderStatus, string> = { new: '#C0703F', making: '#8B6E5C', done: '#A1887F' }
const STATUS_BG: Record<OrderStatus, string> = { new: '#F7E6D6', making: '#F0E6D8', done: '#F2EDE5' }

export function MerchantPhone({ store }: { store: Store }) {
  const { s, d } = store
  const showNav = ['home', 'menu', 'orders', 'settings', 'overview', 'stats', 'design'].includes(s.mScreen)
  const t = DICT[s.lang]
  const [range, setRange] = useState<RangeKey>('week')
  const [menuTheme, setMenuTheme] = useState<MenuTheme>(DEFAULT_THEME)
  // Becomes true once we've loaded the published menu, so we don't republish
  // (and clobber the cloud) before the merchant's in-memory copy matches it.
  const hydrated = useRef(false)

  // On startup, load the published menu (theme + dishes + off-list) from the
  // cloud so the back office matches what customers see; fall back to the local
  // theme cache when nothing is published yet (or KV isn't configured).
  useEffect(() => {
    let alive = true
    ;(async () => {
      const snap = await fetchSnapshot()
      if (!alive) return
      if (snap) {
        setMenuTheme(snap.theme ?? DEFAULT_THEME)
        store.hydrate(snap.dishes ?? [], snap.off ?? [])
      } else {
        setMenuTheme(loadTheme())
      }
      hydrated.current = true
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-publish to the cloud whenever the design or the menu changes, so every
  // scanned phone picks it up. Debounced to coalesce rapid edits.
  useEffect(() => {
    if (!hydrated.current) return
    const off = offIds(s.itemOn)
    const t = setTimeout(() => { void publishSnapshot({ theme: menuTheme, dishes: s.menu, off }) }, 700)
    return () => clearTimeout(t)
  }, [menuTheme, s.menu, s.itemOn])

  // Poll the shared order store so orders placed on customers' phones show up
  // here automatically; also refresh the moment the app regains focus.
  useEffect(() => {
    let alive = true
    const load = async () => {
      const cloud = await fetchOrders()
      if (alive && cloud.length) store.hydrateOrders(cloud)
    }
    load()
    const iv = setInterval(load, 8000)
    const onVis = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVis)
    return () => { alive = false; clearInterval(iv); document.removeEventListener('visibilitychange', onVis) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeTheme = (p: Partial<MenuTheme>) =>
    setMenuTheme((prev) => { const next = { ...prev, ...p }; saveTheme(next); return next })

  // Home quick actions / nav from the dashboard module → existing screens.
  const goScreen = (sk: ScreenKey | 'qr') => {
    if (sk === 'qr') store.goQr()
    else if (sk === 'overview') store.goOverview()
    else if (sk === 'stats') store.goStats()
    else if (sk === 'design') store.goDesign()
    else store.goHome()
  }

  const langToggle = (
    <div onClick={store.toggleLang} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F6EFE6', borderRadius: 11, padding: '6px 11px', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: '#8B6E5C' }}>
      <Icon type="globe" size={16} color="#8B6E5C" />{s.lang === 'zh' ? 'EN' : '中文'}
    </div>
  )

  return (
    <PhoneFrame fullscreen topRight={langToggle}>
      <div className="mm-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {s.mScreen === 'welcome' && <Welcome store={store} />}
        {s.mScreen === 'login' && <Login store={store} />}
        {s.mScreen === 'home' && <V2Home store={store} t={t} onNav={goScreen} />}
        {s.mScreen === 'overview' && <OverviewScreen t={t} range={range} onRange={setRange} onBack={store.goHome} />}
        {s.mScreen === 'stats' && <StatsScreen t={t} lang={s.lang} range={range} onRange={setRange} onBack={store.goHome} />}
        {s.mScreen === 'design' && <MenuDesignScreen t={t} lang={s.lang} theme={menuTheme} onChange={changeTheme} onBack={store.goHome} />}
        {s.mScreen === 'menu' && <MenuMgmt store={store} />}
        {s.mScreen === 'addDish' && <AddDish store={store} />}
        {s.mScreen === 'qr' && <Tables store={store} />}
        {s.mScreen === 'orders' && <Orders store={store} />}
        {s.mScreen === 'settings' && <Settings store={store} />}
      </div>

      {showNav && (
        <div style={{ flex: 'none', height: 'calc(56px + env(safe-area-inset-bottom))', display: 'flex', borderTop: '1px solid #F2E9DD', background: '#FFFFFF', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <NavItem label={d.navHome} icon="home" active={s.mTab === 'home'} onClick={store.goHome} />
          <NavItem label={d.navOrders} icon="clip" active={s.mTab === 'orders'} onClick={store.goOrders} />
          <NavItem label={d.navMenu} icon="menugrid" active={s.mTab === 'menu'} onClick={store.goMenu} />
          <NavItem label={d.navSettings} icon="gear" active={s.mTab === 'settings'} onClick={store.goSettings} />
        </div>
      )}
    </PhoneFrame>
  )
}

function V2Home({ store, t, onNav }: { store: Store; t: DashDict; onNav: (s: ScreenKey | 'qr') => void }) {
  const { s } = store
  const statusLabel: Record<OrderStatus, string> = { new: t.sNew, making: t.sMaking, done: t.sDone }
  const quick: { img: string; label: string; key: ScreenKey | 'qr' }[] = [
    { img: 'qa-design', label: t.designEntry, key: 'design' },
    { img: 'qa-qr', label: t.qrEntry, key: 'qr' },
    { img: 'qa-overview', label: t.ovEntry, key: 'overview' },
    { img: 'qa-stats', label: t.statsEntry, key: 'stats' },
  ]
  const tile = (value: string, label: string, bg: string, valColor: string, labColor: string) => (
    <div style={{ background: bg, borderRadius: 16, padding: 15 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: valColor, letterSpacing: '-.5px' }}>{value}</div>
      <div style={{ fontSize: 12, color: labColor, marginTop: 5 }}>{label}</div>
    </div>
  )
  return (
    <div style={{ padding: '6px 22px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#5C463A', letterSpacing: '-.5px' }}>{t.greeting} 👋</div>
          <div style={{ fontSize: 13, color: '#A1887F', marginTop: 4 }}>{t.greetingSub}</div>
        </div>
        <img src="/assets/m-tray.png" alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 22, padding: 18, marginTop: 20, boxShadow: '0 6px 18px -10px rgba(139,110,92,.25)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#5C463A', marginBottom: 14 }}>{t.todayOverview}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {tile('¥3,210', t.revenue, '#8B6E5C', '#FFF9F3', '#E7D8CA')}
          {tile('58', t.validOrders, '#F6EFE6', '#5C463A', '#A1887F')}
          {tile('6', t.tablesInUse, '#F6EFE6', '#5C463A', '#A1887F')}
          {tile('12', t.pendingOrders, '#F6EFE6', '#C0703F', '#A1887F')}
        </div>
      </div>

      <div style={{ fontSize: 17, fontWeight: 800, color: '#5C463A', marginTop: 28, marginBottom: 14 }}>{t.quick}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {quick.map((q) => (
          <div key={q.key} onClick={() => onNav(q.key)} style={{ background: '#FFFFFF', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 13, boxShadow: '0 4px 14px -10px rgba(139,110,92,.3)', cursor: 'pointer' }}>
            <img src={`/assets/${q.img}.png`} style={{ width: 46, height: 46, objectFit: 'contain', flex: 'none' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#5C463A' }}>{q.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#5C463A' }}>{t.liveOrders}</div>
        <div onClick={store.goOrders} style={{ fontSize: 13, color: '#A1887F', cursor: 'pointer', fontWeight: 600 }}>{t.viewAll} ›</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {s.orders.slice(0, 3).map((o) => (
          <div key={o.id} style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#8B6E5C', flex: 'none' }}>{o.table}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#5C463A' }}>{store.L('桌号 ', 'Table ') + o.table}</div>
              <div style={{ fontSize: 12.5, color: '#A1887F', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itemsText(store, o)}</div>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <div style={{ fontSize: 12, color: '#C4B3A3' }}>{o.time}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[o.status], background: STATUS_BG[o.status], borderRadius: 8, padding: '3px 9px', marginTop: 5 }}>{statusLabel[o.status]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NavItem({ label, icon, active, onClick }: { label: string; icon: 'home' | 'clip' | 'menugrid' | 'gear'; active: boolean; onClick: () => void }) {
  const color = active ? '#8B6E5C' : '#C9B8A6'
  return (
    <div onClick={onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer', color }}>
      <Icon type={icon} size={23} color={color} />
      <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    </div>
  )
}

const primaryBtn = {
  background: '#97785F',
  color: '#FFF9F3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 10px 22px -12px rgba(151,120,95,.7)',
} as const

function Welcome({ store }: { store: Store }) {
  const { d } = store
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 32px 40px', textAlign: 'center', minHeight: 760 }}>
      <img src="/assets/m-hero.png" alt="Momo" style={{ width: 236, height: 236, objectFit: 'contain', marginTop: 30 }} />
      <img src="/assets/logo-word.png" alt="MomoMenu" style={{ height: 48, marginTop: 14 }} />
      <div style={{ fontSize: 15.5, color: '#A1887F', marginTop: 16, lineHeight: 1.6, maxWidth: 250 }}>{d.welcomeSub}</div>
      <div onClick={() => window.location.assign('/?onboarding=1')} style={{ ...primaryBtn, marginTop: 50, width: '100%', height: 60, borderRadius: 20, fontSize: 18, boxShadow: '0 10px 22px -10px rgba(151,120,95,.7)' }}>{d.start}</div>
      <div style={{ marginTop: 24, fontSize: 14.5, color: '#A1887F' }}>
        {d.haveAccount}{' '}
        <span onClick={store.goLogin} style={{ color: '#8B6E5C', fontWeight: 700, cursor: 'pointer' }}>{d.login}</span>
      </div>
    </div>
  )
}

function Login({ store }: { store: Store }) {
  const { d } = store
  const field = { height: 58, background: '#F6EFE6', borderRadius: 16, display: 'flex', alignItems: 'center', padding: '0 18px' } as const
  return (
    <div style={{ padding: '18px 30px 40px', minHeight: 740, display: 'flex', flexDirection: 'column' }}>
      <div onClick={store.goWelcome} style={{ width: 42, height: 42, borderRadius: 14, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon type="back" size={22} />
      </div>
      <img src="/assets/m-tablet.png" alt="" style={{ width: 96, height: 96, objectFit: 'contain', marginTop: 28 }} />
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.5px', color: '#5C463A', marginTop: 14 }}>{d.loginTitle}</div>
      <div style={{ fontSize: 15, color: '#A1887F', marginTop: 10 }}>{d.loginSub}</div>
      <div style={{ marginTop: 36, fontSize: 13.5, fontWeight: 700, color: '#8B6E5C', marginBottom: 10 }}>{d.phone}</div>
      <div style={{ ...field, fontSize: 16, color: '#5C463A', fontWeight: 600 }}>138 8888 8888</div>
      <div style={{ marginTop: 20, fontSize: 13.5, fontWeight: 700, color: '#8B6E5C', marginBottom: 10 }}>{d.pwd}</div>
      <div style={{ ...field, justifyContent: 'space-between', fontSize: 18, color: '#5C463A', letterSpacing: '3px' }}>
        ••••••••<span style={{ fontSize: 15, color: '#C4B3A3', letterSpacing: 0 }}>👁</span>
      </div>
      <div onClick={store.doLogin} style={{ ...primaryBtn, marginTop: 34, height: 60, borderRadius: 20, fontSize: 18 }}>{d.loginBtn}</div>
      <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14.5, color: '#A1887F' }}>
        {d.noAccount} <span onClick={store.doLogin} style={{ color: '#8B6E5C', fontWeight: 700, cursor: 'pointer' }}>{d.register}</span>
      </div>
      <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 30, fontSize: 12.5, color: '#C4B3A3' }}>{d.demoHint}</div>
    </div>
  )
}

function MenuMgmt({ store }: { store: Store }) {
  const { s, d } = store
  const items = s.menu.filter((m) => (s.menuCat === 'all' ? true : m.cat === s.menuCat))
  return (
    <div style={{ padding: '0 0 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 16px' }}>
        <div style={{ width: 38 }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A' }}>{d.menuTitle}</div>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon type="search" size={20} />
        </div>
      </div>
      <div className="mm-scroll" style={{ display: 'flex', gap: 8, padding: '0 22px 14px', overflowX: 'auto' }}>
        {CAT_KEYS.map((k) => (
          <Chip key={k} active={s.menuCat === k} label={catLabel(d, k)} onClick={() => store.setMenuCat(k)} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 14px' }}>
        <div style={{ fontSize: 13, color: '#A1887F' }}>{d.totalDishes} {items.length} {d.dishesUnit}</div>
        <div style={{ fontSize: 13, color: '#8B6E5C', fontWeight: 600 }}>{d.manageCat} ⠿</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: '0 22px' }}>
        {items.map((m) => {
          const on = store.isOn(m.id)
          return (
            <div key={m.id} style={{ background: '#FFFFFF', borderRadius: 18, padding: 14, display: 'flex', gap: 13, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
              <div style={{ width: 62, height: 62, borderRadius: 15, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon type={m.icon} size={34} color="#A07E63" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 16.5, fontWeight: 700, color: '#5C463A' }}>{store.nm(m)}</span>
                  {m.feat && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#C0703F', background: '#F7E6D6', borderRadius: 6, padding: '2px 7px' }}>{d.featured}</span>}
                </div>
                <div style={{ fontSize: 12, color: '#A1887F', marginTop: 6 }}>{d.soldLab} {m.sold}{'   '}{d.likeLab} {m.like}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#8B6E5C', marginTop: 6 }}>¥{m.price}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flex: 'none' }}>
                <div onClick={() => store.toggleItem(m.id)} style={{ width: 46, height: 27, borderRadius: 14, background: on ? '#C99A6E' : '#E7DAC9', position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: 3, width: 21, height: 21, borderRadius: '50%', background: '#FFF9F3', transition: 'transform .2s', transform: `translateX(${on ? '19px' : '0px'})`, boxShadow: '0 1px 3px rgba(92,74,61,.3)' }} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#8B6E5C', border: '1px solid #EAD9C7', borderRadius: 9, padding: '5px 14px', cursor: 'pointer' }}>{d.edit}</div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ padding: 22 }}>
        <div onClick={store.goAddDish} style={{ ...primaryBtn, height: 58, borderRadius: 18, fontSize: 17 }}>＋ {d.addDish}</div>
      </div>
    </div>
  )
}

function AddDish({ store }: { store: Store }) {
  const { s, d, L } = store
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<ExtractedDish[] | null>(null)

  const reset = () => { setResults(null); setError('') }
  const switchTab = (m: 'manual' | 'file' | 'photo') => { store.setAddMethod(m); reset() }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true); setError(''); setResults(null)
    try {
      setResults(await extractMenu(f))
    } catch (err) {
      setError(err instanceof Error ? err.message : '识别失败，请重试。')
    } finally {
      setBusy(false)
    }
  }
  const addAll = () => {
    const valid = (results ?? []).filter((r) => r.name.trim())
    if (!valid.length) return
    store.addDishes(valid.map((r, i) => toDish({ ...r, name: r.name.trim() }, i)))
    store.goMenu()
  }

  const tab = (label: string, active: boolean, onClick: () => void) => (
    <div onClick={onClick} style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '13px 6px', borderRadius: 14, background: active ? '#8B6E5C' : '#F6EFE6', color: active ? '#FFF9F3' : '#A1887F', fontSize: 13.5, fontWeight: 700 }}>{label}</div>
  )
  const isScan = s.addMethod === 'file' || s.addMethod === 'photo'
  const accept = s.addMethod === 'photo' ? 'image/*' : 'image/*,application/pdf,.doc,.docx'

  return (
    <div style={{ padding: '0 0 40px' }}>
      <input ref={fileRef} type="file" accept={accept} {...(s.addMethod === 'photo' ? { capture: 'environment' as const } : {})} onChange={onFile} style={{ display: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 18px' }}>
        <div onClick={store.goMenu} style={{ width: 42, height: 42, borderRadius: 14, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon type="back" size={22} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A' }}>{d.addTitle}</div>
        <div style={{ width: 42 }} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 22px 22px' }}>
        {tab(d.mManual, s.addMethod === 'manual', () => switchTab('manual'))}
        {tab(d.mFile, s.addMethod === 'file', () => switchTab('file'))}
        {tab(d.mPhoto, s.addMethod === 'photo', () => switchTab('photo'))}
      </div>

      {isScan && (results || busy || error) ? (
        <ScanResult store={store} busy={busy} error={error} results={results} setResults={setResults} onPick={() => fileRef.current?.click()} onAddAll={addAll} />
      ) : null}

      {s.addMethod === 'manual' && (
        <div style={{ padding: '0 22px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 18, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 18, border: '1.6px dashed #D8C4B2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, flex: 'none', cursor: 'pointer', color: '#B8A593' }}>
                <Icon type="cam" size={24} color="#B8A593" /><span style={{ fontSize: 10.5 }}>{d.fImg}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8B6E5C', marginBottom: 7 }}>{d.fName}</div>
                <div style={{ height: 46, background: '#F6EFE6', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 14, color: '#C4B3A3' }}>{d.fNamePh}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8B6E5C', marginBottom: 7 }}>{d.fPrice}</div>
                <div style={{ height: 46, background: '#F6EFE6', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, color: '#5C463A', fontWeight: 700 }}>¥ 28</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8B6E5C', marginBottom: 7 }}>{d.fCat}</div>
                <div style={{ height: 46, background: '#F6EFE6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontSize: 14, color: '#5C463A' }}>{d.catStaple} ⌄</div>
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12.5, fontWeight: 700, color: '#8B6E5C', marginBottom: 7 }}>{d.fDesc}</div>
            <div style={{ minHeight: 70, background: '#F6EFE6', borderRadius: 12, padding: '13px 14px', fontSize: 14, color: '#C4B3A3', lineHeight: 1.5 }}>{d.fDescPh}</div>
          </div>
        </div>
      )}

      {s.addMethod === 'file' && !results && !busy && !error && (
        <div style={{ padding: '0 22px' }}>
          <div onClick={() => fileRef.current?.click()} style={{ background: '#FFFFFF', borderRadius: 20, padding: '26px 22px', boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)', textAlign: 'center', cursor: 'pointer' }}>
            <img src="/assets/m-mix.png" alt="" style={{ width: 120, height: 120, objectFit: 'contain' }} />
            <div style={{ width: '100%', height: 118, borderRadius: 18, border: '2px dashed #D8C4B2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8, color: '#B8A593' }}>
              <Icon type="file" size={46} color="#B8A593" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A', marginTop: 18 }}>{d.fileTitle}</div>
            <div style={{ fontSize: 13.5, color: '#A1887F', marginTop: 9, lineHeight: 1.5 }}>{L('点击选择图片 / PDF / Word 菜单，AI 自动识别。', 'Tap to choose a menu image, PDF or Word — AI reads it.')}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {['JPG', 'PNG', 'PDF', 'Word'].map((f) => (
                <span key={f} style={{ fontSize: 11.5, fontWeight: 700, color: '#8B6E5C', background: '#F6EFE6', borderRadius: 8, padding: '5px 11px' }}>{f}</span>
              ))}
            </div>
          </div>
          <div onClick={() => fileRef.current?.click()} style={{ ...primaryBtn, height: 56, borderRadius: 16, fontSize: 16, marginTop: 16 }}>
            <Icon type="file" size={20} color="#FFF9F3" />&nbsp;{L('选择文件', 'Choose file')}
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 16, background: '#F6EFE6', borderRadius: 14, padding: 14 }}>
            <div style={{ flex: 'none' }}><Icon type="spark" size={22} color="#C0703F" /></div>
            <div style={{ fontSize: 13, color: '#8B6E5C', lineHeight: 1.5 }}>{d.fileSmart}</div>
          </div>
        </div>
      )}

      {s.addMethod === 'photo' && !results && !busy && !error && (
        <div style={{ padding: '0 22px' }}>
          <div onClick={() => fileRef.current?.click()} style={{ background: '#5C4A3D', borderRadius: 20, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: 24, left: 24, width: 26, height: 26, borderTop: '3px solid #F6EFE6', borderLeft: '3px solid #F6EFE6', borderTopLeftRadius: 8 }} />
            <div style={{ position: 'absolute', top: 24, right: 24, width: 26, height: 26, borderTop: '3px solid #F6EFE6', borderRight: '3px solid #F6EFE6', borderTopRightRadius: 8 }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24, width: 26, height: 26, borderBottom: '3px solid #F6EFE6', borderLeft: '3px solid #F6EFE6', borderBottomLeftRadius: 8 }} />
            <div style={{ position: 'absolute', bottom: 24, right: 24, width: 26, height: 26, borderBottom: '3px solid #F6EFE6', borderRight: '3px solid #F6EFE6', borderBottomRightRadius: 8 }} />
            <div style={{ color: 'rgba(246,239,230,.7)' }}><Icon type="cam" size={50} color="#FFF9F3" /></div>
            <div style={{ color: '#F6EFE6', fontSize: 14, marginTop: 16, fontWeight: 600 }}>{d.photoHint}</div>
          </div>
          <div onClick={() => fileRef.current?.click()} style={{ display: 'flex', justifyContent: 'center', marginTop: 22, cursor: 'pointer' }}>
            <div style={{ width: 74, height: 74, borderRadius: '50%', border: '4px solid #97785F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#97785F' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 20, background: '#F6EFE6', borderRadius: 14, padding: 14 }}>
            <div style={{ flex: 'none' }}><Icon type="spark" size={22} color="#C0703F" /></div>
            <div style={{ fontSize: 13, color: '#8B6E5C', lineHeight: 1.5 }}>{d.photoSmart}</div>
          </div>
        </div>
      )}

      {s.addMethod === 'manual' && (
        <div style={{ padding: '24px 22px 0' }}>
          <div onClick={store.goMenu} style={{ ...primaryBtn, height: 58, borderRadius: 18, fontSize: 17 }}>{d.saveManual}</div>
        </div>
      )}
    </div>
  )
}

function ScanResult({ store, busy, error, results, setResults, onPick, onAddAll }: { store: Store; busy: boolean; error: string; results: ExtractedDish[] | null; setResults: (r: ExtractedDish[]) => void; onPick: () => void; onAddAll: () => void }) {
  const { d, L } = store
  if (busy) {
    return (
      <div style={{ padding: '10px 22px 0', textAlign: 'center' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '40px 22px', boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
          <div style={{ display: 'inline-flex' }}><Icon type="spark" size={40} color="#C0703F" /></div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#5C463A', marginTop: 14 }}>{L('AI 识别中…', 'Reading the menu…')}</div>
          <div style={{ fontSize: 13, color: '#A1887F', marginTop: 8 }}>{L('正在提取菜名与价格，约需 5–15 秒。', 'Extracting dishes and prices, ~5–15s.')}</div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div style={{ padding: '10px 22px 0' }}>
        <div style={{ background: '#FBEDE7', border: '1px solid #F0C9B6', borderRadius: 16, padding: 16, color: '#B5532E', fontSize: 14, lineHeight: 1.5 }}>{error}</div>
        <div onClick={onPick} style={{ ...primaryBtn, height: 54, borderRadius: 16, fontSize: 16, marginTop: 14 }}>{L('重新选择', 'Try again')}</div>
      </div>
    )
  }
  if (!results) return null
  if (results.length === 0) {
    return (
      <div style={{ padding: '10px 22px 0' }}>
        <div style={{ background: '#F6EFE6', borderRadius: 16, padding: 16, color: '#8B6E5C', fontSize: 14, lineHeight: 1.5 }}>{L('没有识别到菜品，换一张更清晰的菜单试试。', 'No dishes found — try a clearer menu image.')}</div>
        <div onClick={onPick} style={{ ...primaryBtn, height: 54, borderRadius: 16, fontSize: 16, marginTop: 14 }}>{L('重新选择', 'Try again')}</div>
      </div>
    )
  }
  // Editable review step — owner can fix name / price / category, delete a row,
  // or add one by hand, before generating the menu.
  const editCats: CatKey[] = CAT_KEYS.filter((k) => k !== 'all')
  const update = (i: number, patch: Partial<ExtractedDish>) =>
    setResults(results.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const remove = (i: number) => setResults(results.filter((_, idx) => idx !== i))
  const addRow = () => setResults([...results, { name: '', price: 0, category: 'staple', description: '' }])

  const fieldLabel: CSSProperties = { fontSize: 11, fontWeight: 700, color: '#8B6E5C', marginBottom: 5 }
  const inputStyle: CSSProperties = { width: '100%', background: '#F6EFE6', border: 'none', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#5C463A', fontWeight: 600, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }

  return (
    <div style={{ padding: '4px 22px 0' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#5C463A', marginBottom: 4 }}>{L(`识别到 ${results.length} 道菜`, `Found ${results.length} dishes`)}</div>
      <div style={{ fontSize: 12.5, color: '#A1887F', marginBottom: 12, lineHeight: 1.5 }}>{L('核对并修改菜名、价格、分类，确认无误后生成菜单。', 'Review and edit name, price and category, then generate the menu.')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map((r, i) => (
          <div key={i} style={{ background: '#FFFFFF', borderRadius: 16, padding: 14, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#C4B3A3' }}>#{i + 1}</div>
              <div onClick={() => remove(i)} style={{ width: 28, height: 28, borderRadius: 9, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#B5532E', fontSize: 15, fontWeight: 700 }}>✕</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={fieldLabel}>{d.fName}</div>
              <input value={r.name} onChange={(e) => update(i, { name: e.target.value })} placeholder={d.fNamePh} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={fieldLabel}>{d.fPrice}</div>
                <input value={r.price === 0 ? '' : String(r.price)} onChange={(e) => update(i, { price: Math.max(0, Number(e.target.value.replace(/[^\d.]/g, '')) || 0) })} inputMode="decimal" placeholder="0" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={fieldLabel}>{d.fCat}</div>
                <select value={r.category} onChange={(e) => update(i, { category: e.target.value as CatKey })} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
                  {editCats.map((k) => (
                    <option key={k} value={k}>{catLabel(d, k)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div onClick={addRow} style={{ height: 48, borderRadius: 14, border: '1.6px dashed #D8C4B2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12, color: '#8B6E5C', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>＋ {L('添加一行', 'Add a row')}</div>
      <div onClick={onAddAll} style={{ ...primaryBtn, height: 56, borderRadius: 16, fontSize: 16, marginTop: 16, opacity: results.length ? 1 : 0.5, pointerEvents: results.length ? 'auto' : 'none' }}>{L(`生成菜单（${results.length}）`, `Generate menu (${results.length})`)}</div>
      <div onClick={onPick} style={{ textAlign: 'center', marginTop: 14, fontSize: 14, fontWeight: 700, color: '#A1887F', cursor: 'pointer' }}>{L('重新选择', 'Choose another')}</div>
    </div>
  )
}

function Tables({ store }: { store: Store }) {
  const { s, d } = store
  const base = appBaseUrl()
  const statusColor = { inUse: '#C0703F', idle: '#A1887F', cleaning: '#9A8FB0' }
  return (
    <div style={{ padding: '0 0 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 18px' }}>
        <div onClick={store.goHome} style={{ width: 42, height: 42, borderRadius: 14, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon type="back" size={22} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A' }}>{d.qrTitle}</div>
        <div onClick={() => downloadAllQr(d.restName, base, s.tables)} style={{ fontSize: 13, color: '#8B6E5C', fontWeight: 700, cursor: 'pointer' }}>{d.batch}</div>
      </div>
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '0 22px 16px', background: '#F6EFE6', borderRadius: 14, padding: '12px 14px' }}>
        <div style={{ flex: 'none' }}><Icon type="spark" size={20} color="#C0703F" /></div>
        <div style={{ fontSize: 12.5, color: '#8B6E5C', lineHeight: 1.5 }}>{store.L('每桌一个专属二维码，顾客扫码即可进入该桌点餐。', 'Each table has its own QR — guests scan it to order for that table.')}</div>
      </div>
      <div style={{ padding: '0 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {s.tables.map((t) => (
          <div key={t.id} style={{ background: '#FFFFFF', borderRadius: 18, padding: 16, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#5C463A' }}>{store.L(t.name + ' 桌', 'Table ' + t.name)}</div>
              <div style={{ fontSize: 11, color: '#A1887F' }}>{d[t.seats]}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
              <QrCode value={tableLink(base, t.id)} size={92} />
            </div>
            <div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: statusColor[t.status], marginTop: 10 }}>{d[t.status]}</div>
            <div onClick={() => downloadTableQr(d.restName, base, t)} style={{ marginTop: 11, height: 34, borderRadius: 10, border: '1px solid #EAD9C7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#8B6E5C', cursor: 'pointer' }}>
              <Icon type="file" size={15} color="#8B6E5C" />{store.L('下载', 'Save')}
            </div>
          </div>
        ))}
        <div onClick={store.addTable} style={{ background: '#F6EFE6', border: '1.6px dashed #D8C4B2', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', minHeight: 150, color: '#A1887F' }}>
          <div style={{ fontSize: 30, fontWeight: 400, lineHeight: 0.7 }}>＋</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{d.addTable}</div>
        </div>
      </div>
      <div style={{ padding: 22 }}>
        <div onClick={() => downloadAllQr(d.restName, base, s.tables)} style={{ ...primaryBtn, height: 56, borderRadius: 18, fontSize: 16 }}>{d.downloadAll}</div>
      </div>
    </div>
  )
}

function Orders({ store }: { store: Store }) {
  const { s, d } = store
  const filtKeys: { k: 'all' | 'new' | 'making' | 'done'; label: string }[] = [
    { k: 'all', label: store.L('全部', 'All') },
    { k: 'new', label: d.sNew },
    { k: 'making', label: d.sMaking },
    { k: 'done', label: d.sDone },
  ]
  const filtered = s.orders.filter((o) => (s.orderFilter === 'all' ? true : o.status === s.orderFilter))
  return (
    <div style={{ padding: '0 0 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 22px 18px' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A' }}>{d.ordersTitle}</div>
      </div>
      <div style={{ display: 'flex', gap: 18, padding: '0 22px 16px' }}>
        {filtKeys.map((f) => {
          const active = s.orderFilter === f.k
          return (
            <div key={f.k} onClick={() => store.setOrderFilter(f.k)} style={{ fontSize: 14, fontWeight: 700, color: active ? '#8B6E5C' : '#C4B3A3', borderBottom: `2px solid ${active ? '#8B6E5C' : 'transparent'}`, paddingBottom: 6, cursor: 'pointer' }}>{f.label}</div>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 22px' }}>
        {filtered.map((o) => {
          const note = store.L(o.note[0], o.note[1])
          const hasAction = o.status !== 'done'
          return (
            <div key={o.id} style={{ background: '#FFFFFF', borderRadius: 18, padding: 16, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: '#8B6E5C', color: '#FFF9F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flex: 'none' }}>{o.table}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#5C463A' }}>{store.L('桌号 ', 'Table ') + o.table}</div>
                  <div style={{ fontSize: 12, color: '#C4B3A3', marginTop: 2 }}>{o.time}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: STATUS_COLOR[o.status], background: STATUS_BG[o.status], borderRadius: 9, padding: '6px 12px' }}>{statusLabel(d, o.status)}</div>
              </div>
              <div style={{ marginTop: 13, paddingTop: 13, borderTop: '1px solid #F2E9DD', fontSize: 13.5, color: '#6B5447', lineHeight: 1.6 }}>{itemsText(store, o)}</div>
              {note && <div style={{ fontSize: 12.5, color: '#A1887F', marginTop: 6 }}>{d.noteLab}：{note}</div>}
              {hasAction && (
                <div onClick={() => store.advance(o.id)} style={{ marginTop: 14, height: 46, background: o.status === 'new' ? '#97785F' : '#FFFFFF', color: o.status === 'new' ? '#FFF9F3' : '#8B6E5C', border: o.status === 'new' ? 'none' : '1.5px solid #EAD9C7', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  {o.status === 'new' ? d.accept : d.complete}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Settings({ store }: { store: Store }) {
  const { s, d } = store
  const rows: { key: string; label: string; value: string; icon: 'clip' | 'home' | 'bell' | 'gear'; border: string }[] = [
    { key: 'hours', label: d.bizHours, value: d.bizHoursVal, icon: 'clip', border: 'none' },
    { key: 'profile', label: d.profile, value: d.profileVal, icon: 'home', border: '1px solid #F2E9DD' },
    { key: 'notif', label: d.notif, value: d.notifVal, icon: 'bell', border: '1px solid #F2E9DD' },
    { key: 'account', label: d.account, value: d.accountVal, icon: 'gear', border: '1px solid #F2E9DD' },
  ]
  const langPill = (label: string, active: boolean) => (
    <div style={{ padding: '6px 13px', borderRadius: 8, background: active ? '#8B6E5C' : 'transparent', color: active ? '#FFF9F3' : '#A1887F' }}>{label}</div>
  )
  return (
    <div style={{ padding: '0 0 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 22px 18px' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A' }}>{d.settingsTitle}</div>
      </div>
      <div style={{ padding: '0 22px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 18, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)', display: 'flex', alignItems: 'center', gap: 15 }}>
          <img src="/assets/m-tray.png" alt="" style={{ width: 58, height: 58, objectFit: 'contain', flex: 'none' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A' }}>{d.restName}</div>
            <div style={{ fontSize: 13, color: '#A1887F', marginTop: 3 }}>138 8888 8888</div>
          </div>
          <div style={{ color: '#C4B3A3' }}>›</div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: '#A1887F', margin: '24px 4px 10px' }}>{d.langSection}</div>
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '6px 18px', boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ color: '#8B6E5C' }}><Icon type="globe" size={22} /></div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: '#5C463A' }}>{d.language}</div>
            </div>
            <div onClick={store.toggleLang} style={{ display: 'flex', background: '#F6EFE6', borderRadius: 11, padding: 3, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              {langPill('中文', s.lang === 'zh')}
              {langPill('EN', s.lang === 'en')}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: '#A1887F', margin: '24px 4px 10px' }}>{d.bizSection}</div>
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '0 18px', boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
          {rows.map((r) => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: r.border }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ color: '#8B6E5C' }}><Icon type={r.icon} size={22} /></div>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: '#5C463A' }}>{r.label}</div>
              </div>
              <div style={{ fontSize: 13.5, color: '#A1887F' }}>{r.value} ›</div>
            </div>
          ))}
        </div>

        <div onClick={store.goWelcome} style={{ marginTop: 24, height: 54, background: '#FFFFFF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15.5, fontWeight: 700, color: '#C0703F', boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)', cursor: 'pointer' }}>{d.logout}</div>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#C4B3A3' }}>MomoMenu · {d.version} 1.0.0</div>
      </div>
    </div>
  )
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ flex: 'none', cursor: 'pointer', fontSize: 14.5, fontWeight: 700, padding: '8px 16px', borderRadius: 18, background: active ? '#8B6E5C' : 'transparent', color: active ? '#FFF9F3' : '#A1887F', whiteSpace: 'nowrap' }}>{label}</div>
  )
}

function statusLabel(d: Store['d'], st: OrderStatus): string {
  return { new: d.sNew, making: d.sMaking, done: d.sDone }[st]
}

function itemsText(store: Store, o: Order): string {
  const { d, s } = store
  return o.items
    .map(([zh, en, q]) => (s.lang === 'zh' ? q + d.portions + zh : q + d.portions + ' ' + en))
    .join(s.lang === 'zh' ? '、' : ', ')
}
