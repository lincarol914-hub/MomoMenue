import { CAT_KEYS, MENU, catLabel, type Order, type OrderStatus } from '../data'
import type { Store } from '../store'
import { appBaseUrl, downloadAllQr, downloadTableQr, tableLink } from '../qr-export'
import { Icon } from './Icon'
import { PhoneFrame } from './PhoneFrame'
import { QrCode } from './QrCode'

const STATUS_COLOR: Record<OrderStatus, string> = { new: '#C0703F', making: '#8B6E5C', done: '#A1887F' }
const STATUS_BG: Record<OrderStatus, string> = { new: '#F7E6D6', making: '#F0E6D8', done: '#F2EDE5' }

export function MerchantPhone({ store }: { store: Store }) {
  const { s, d } = store
  const showNav = ['home', 'menu', 'orders', 'settings'].includes(s.mScreen)

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
        {s.mScreen === 'home' && (s.variant === 'a' ? <HomeA store={store} /> : <HomeB store={store} />)}
        {s.mScreen === 'menu' && <MenuMgmt store={store} />}
        {s.mScreen === 'addDish' && <AddDish store={store} />}
        {s.mScreen === 'qr' && <Tables store={store} />}
        {s.mScreen === 'orders' && <Orders store={store} />}
        {s.mScreen === 'settings' && <Settings store={store} />}
      </div>

      {showNav && (
        <div style={{ flex: 'none', height: 84, display: 'flex', borderTop: '1px solid #F2E9DD', background: '#FFFFFF', paddingBottom: 16 }}>
          <NavItem label={d.navHome} icon="home" active={s.mTab === 'home'} onClick={store.goHome} />
          <NavItem label={d.navOrders} icon="clip" active={s.mTab === 'orders'} onClick={store.goOrders} />
          <NavItem label={d.navMenu} icon="menugrid" active={s.mTab === 'menu'} onClick={store.goMenu} />
          <NavItem label={d.navSettings} icon="gear" active={s.mTab === 'settings'} onClick={store.goSettings} />
        </div>
      )}
    </PhoneFrame>
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
      <div onClick={store.goLogin} style={{ ...primaryBtn, marginTop: 50, width: '100%', height: 60, borderRadius: 20, fontSize: 18, boxShadow: '0 10px 22px -10px rgba(151,120,95,.7)' }}>{d.start}</div>
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

function StatCard({ value, label, bg, valColor, labColor }: { value: string; label: string; bg: string; valColor: string; labColor: string }) {
  return (
    <div style={{ background: bg, borderRadius: 16, padding: 15 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: valColor, letterSpacing: '-.5px' }}>{value}</div>
      <div style={{ fontSize: 12, color: labColor, marginTop: 5 }}>{label}</div>
    </div>
  )
}

function LiveOrderRow({ store, o, darkBadge }: { store: Store; o: Order; darkBadge?: boolean }) {
  const { d } = store
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: darkBadge ? '#8B6E5C' : '#F6EFE6', color: darkBadge ? '#FFF9F3' : '#8B6E5C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flex: 'none' }}>{o.table}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#5C463A' }}>{store.L('桌号 ', 'Table ') + o.table}</div>
        <div style={{ fontSize: 12.5, color: '#A1887F', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itemsText(store, o)}</div>
      </div>
      <div style={{ textAlign: 'right', flex: 'none' }}>
        <div style={{ fontSize: 12, color: '#C4B3A3' }}>{o.time}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[o.status], background: STATUS_BG[o.status], borderRadius: 8, padding: '3px 9px', marginTop: 5 }}>{statusLabel(d, o.status)}</div>
      </div>
    </div>
  )
}

function HomeA({ store }: { store: Store }) {
  const { s, d } = store
  return (
    <div style={{ padding: '6px 22px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#5C463A', letterSpacing: '-.5px' }}>{d.greeting} 👋</div>
          <div style={{ fontSize: 13, color: '#A1887F', marginTop: 4 }}>{d.greetingSub}</div>
        </div>
        <img src="/assets/m-tray.png" alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 22, padding: 18, marginTop: 20, boxShadow: '0 6px 18px -10px rgba(139,110,92,.25)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#5C463A', marginBottom: 14 }}>{d.todayOverview}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          <StatCard value="¥3,210" label={d.revenue} bg="#8B6E5C" valColor="#FFF9F3" labColor="#E7D8CA" />
          <StatCard value="58" label={d.validOrders} bg="#F6EFE6" valColor="#5C463A" labColor="#A1887F" />
          <StatCard value="6" label={d.tablesInUse} bg="#F6EFE6" valColor="#5C463A" labColor="#A1887F" />
          <StatCard value="12" label={d.pendingOrders} bg="#F6EFE6" valColor="#C0703F" labColor="#A1887F" />
        </div>
      </div>

      <div style={{ fontSize: 17, fontWeight: 800, color: '#5C463A', marginTop: 28, marginBottom: 14 }}>{d.quick}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        <QuickCard img="ic-menu" label={d.menuMgmt} onClick={store.goMenu} />
        <QuickCard img="ic-qr" label={d.qr} onClick={store.goQr} />
        <QuickCard img="ic-order" label={d.orderCenter} onClick={store.goOrders} />
        <QuickCard img="ic-gear" label={d.bizSet} onClick={store.goSettings} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#5C463A' }}>{d.liveOrders}</div>
        <div onClick={store.goOrders} style={{ fontSize: 13, color: '#A1887F', cursor: 'pointer', fontWeight: 600 }}>{d.viewAll} ›</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {s.orders.slice(0, 3).map((o) => <LiveOrderRow key={o.id} store={store} o={o} />)}
      </div>
    </div>
  )
}

function QuickCard({ img, label, onClick }: { img: string; label: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: '#FFFFFF', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 13, boxShadow: '0 4px 14px -10px rgba(139,110,92,.3)', cursor: 'pointer' }}>
      <img src={`assets/${img}.png`} style={{ width: 46, height: 46, objectFit: 'contain', flex: 'none' }} />
      <div style={{ fontSize: 15, fontWeight: 700, color: '#5C463A' }}>{label}</div>
    </div>
  )
}

function HomeB({ store }: { store: Store }) {
  const { s, d } = store
  const stat = (v: string, l: string) => (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div>
      <div style={{ fontSize: 11.5, color: '#D8C4B2', marginTop: 2 }}>{l}</div>
    </div>
  )
  const divider = <div style={{ width: 1, background: 'rgba(255,249,243,.22)' }} />
  return (
    <div style={{ padding: '6px 0 30px' }}>
      <div style={{ margin: '0 22px', background: '#8B6E5C', borderRadius: 26, padding: 24, color: '#FFF9F3', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, color: '#E7D8CA' }}>{d.greeting} 👋</div>
            <div style={{ fontSize: 13, color: '#D8C4B2', marginTop: 24 }}>{d.revenue}</div>
            <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-2px', marginTop: 4 }}>¥3,210</div>
          </div>
          <img src="/assets/m-tray.png" alt="" style={{ width: 88, height: 88, objectFit: 'contain', marginTop: -4 }} />
        </div>
        <div style={{ display: 'flex', gap: 22, marginTop: 16 }}>
          {stat('58', d.validOrders)}
          {divider}
          {stat('6', d.tablesInUse)}
          {divider}
          {stat('12', d.pendingOrders)}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '26px 26px 6px' }}>
        <QuickIcon img="ic-menu" label={d.menuMgmt} onClick={store.goMenu} />
        <QuickIcon img="ic-qr" label={d.qr} onClick={store.goQr} />
        <QuickIcon img="ic-order" label={d.orderCenter} onClick={store.goOrders} />
        <QuickIcon img="ic-gear" label={d.bizSet} onClick={store.goSettings} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 22px 14px' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#5C463A' }}>{d.liveOrders}</div>
        <div onClick={store.goOrders} style={{ fontSize: 13, color: '#A1887F', cursor: 'pointer', fontWeight: 600 }}>{d.viewAll} ›</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '0 22px' }}>
        {s.orders.slice(0, 3).map((o) => <LiveOrderRow key={o.id} store={store} o={o} darkBadge />)}
      </div>
    </div>
  )
}

function QuickIcon({ img, label, onClick }: { img: string; label: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, cursor: 'pointer', flex: 'none' }}>
      <div style={{ width: 62, height: 62, borderRadius: 20, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 14px -8px rgba(139,110,92,.4)' }}>
        <img src={`assets/${img}.png`} style={{ width: 42, height: 42, objectFit: 'contain' }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6B5447' }}>{label}</div>
    </div>
  )
}

function MenuMgmt({ store }: { store: Store }) {
  const { s, d } = store
  const items = MENU.filter((m) => (s.menuCat === 'all' ? true : m.cat === s.menuCat))
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
  const { s, d } = store
  const tab = (label: string, active: boolean, onClick: () => void) => (
    <div onClick={onClick} style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '13px 6px', borderRadius: 14, background: active ? '#8B6E5C' : '#F6EFE6', color: active ? '#FFF9F3' : '#A1887F', fontSize: 13.5, fontWeight: 700 }}>{label}</div>
  )
  const primaryLabel = s.addMethod === 'manual' ? d.saveManual : s.addMethod === 'file' ? d.saveFile : d.savePhoto
  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 18px' }}>
        <div onClick={store.goMenu} style={{ width: 42, height: 42, borderRadius: 14, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon type="back" size={22} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A' }}>{d.addTitle}</div>
        <div style={{ width: 42 }} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 22px 22px' }}>
        {tab(d.mManual, s.addMethod === 'manual', () => store.setAddMethod('manual'))}
        {tab(d.mFile, s.addMethod === 'file', () => store.setAddMethod('file'))}
        {tab(d.mPhoto, s.addMethod === 'photo', () => store.setAddMethod('photo'))}
      </div>

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

      {s.addMethod === 'file' && (
        <div style={{ padding: '0 22px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '26px 22px', boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)', textAlign: 'center' }}>
            <img src="/assets/m-mix.png" alt="" style={{ width: 120, height: 120, objectFit: 'contain' }} />
            <div style={{ width: '100%', height: 118, borderRadius: 18, border: '2px dashed #D8C4B2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8, color: '#B8A593' }}>
              <Icon type="file" size={46} color="#B8A593" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A', marginTop: 18 }}>{d.fileTitle}</div>
            <div style={{ fontSize: 13.5, color: '#A1887F', marginTop: 9, lineHeight: 1.5 }}>{d.fileFormats}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {['Excel', 'Word', 'PDF'].map((f) => (
                <span key={f} style={{ fontSize: 11.5, fontWeight: 700, color: '#8B6E5C', background: '#F6EFE6', borderRadius: 8, padding: '5px 11px' }}>{f}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 16, background: '#F6EFE6', borderRadius: 14, padding: 14 }}>
            <div style={{ flex: 'none' }}><Icon type="spark" size={22} color="#C0703F" /></div>
            <div style={{ fontSize: 13, color: '#8B6E5C', lineHeight: 1.5 }}>{d.fileSmart}</div>
          </div>
        </div>
      )}

      {s.addMethod === 'photo' && (
        <div style={{ padding: '0 22px' }}>
          <div style={{ background: '#5C4A3D', borderRadius: 20, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 24, left: 24, width: 26, height: 26, borderTop: '3px solid #F6EFE6', borderLeft: '3px solid #F6EFE6', borderTopLeftRadius: 8 }} />
            <div style={{ position: 'absolute', top: 24, right: 24, width: 26, height: 26, borderTop: '3px solid #F6EFE6', borderRight: '3px solid #F6EFE6', borderTopRightRadius: 8 }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24, width: 26, height: 26, borderBottom: '3px solid #F6EFE6', borderLeft: '3px solid #F6EFE6', borderBottomLeftRadius: 8 }} />
            <div style={{ position: 'absolute', bottom: 24, right: 24, width: 26, height: 26, borderBottom: '3px solid #F6EFE6', borderRight: '3px solid #F6EFE6', borderBottomRightRadius: 8 }} />
            <div style={{ color: 'rgba(246,239,230,.7)' }}><Icon type="cam" size={50} color="#FFF9F3" /></div>
            <div style={{ color: '#F6EFE6', fontSize: 14, marginTop: 16, fontWeight: 600 }}>{d.photoHint}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
            <div style={{ width: 74, height: 74, borderRadius: '50%', border: '4px solid #97785F', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#97785F' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 20, background: '#F6EFE6', borderRadius: 14, padding: 14 }}>
            <div style={{ flex: 'none' }}><Icon type="spark" size={22} color="#C0703F" /></div>
            <div style={{ fontSize: 13, color: '#8B6E5C', lineHeight: 1.5 }}>{d.photoSmart}</div>
          </div>
        </div>
      )}

      <div style={{ padding: '24px 22px 0' }}>
        <div onClick={store.goMenu} style={{ ...primaryBtn, height: 58, borderRadius: 18, fontSize: 17 }}>{primaryLabel}</div>
      </div>
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
