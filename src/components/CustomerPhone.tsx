import { CAT_KEYS, MENU, catLabel, type CatKey, type OrderStatus } from '../data'
import type { Store } from '../store'
import { useMenuTheme } from '../menu-theme'
import { patternBackground, type MenuTheme } from '../dashboard/lib/menu-design'
import { Icon } from './Icon'
import { PhoneFrame } from './PhoneFrame'

const primaryBar = {
  background: '#97785F',
  color: '#FFF9F3',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  boxShadow: '0 10px 22px -12px rgba(151,120,95,.7)',
} as const

export function CustomerPhone({ store }: { store: Store }) {
  const { s, d } = store
  const theme = useMenuTheme()
  const showBar = s.cScreen === 'menu' || s.cScreen === 'cart'
  const cartTotal = s.cart.reduce((a, c) => a + (store.find(c.id)?.price ?? 0) * c.qty, 0)
  const cartCount = s.cart.reduce((a, c) => a + c.qty, 0)
  const barLabel = s.cScreen === 'cart' ? d.cSubmit : d.cGoCart
  const barAction = s.cScreen === 'cart' ? store.submitOrder : store.goCart

  return (
    <PhoneFrame fullscreen topColor={theme.color}>
      <div className="mm-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {s.cScreen === 'menu' && <CustomerMenu store={store} theme={theme} />}
        {s.cScreen === 'detail' && <CustomerDetail store={store} theme={theme} />}
        {s.cScreen === 'cart' && <CustomerCart store={store} />}
        {s.cScreen === 'success' && <CustomerSuccess store={store} />}
      </div>

      {showBar && (
        <div style={{ flex: 'none', background: '#FFF9F3', borderTop: '1px solid #F2E9DD', paddingTop: 14, paddingLeft: 22, paddingRight: 22, paddingBottom: 'calc(26px + env(safe-area-inset-bottom))' }}>
          <div onClick={barAction} style={{ ...primaryBar, background: theme.color, height: 56, borderRadius: 16, justifyContent: 'space-between', padding: '0 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ position: 'relative' }}>
                <Icon type="cart" size={24} color="#FFF9F3" />
                {s.cart.length > 0 && (
                  <div style={{ position: 'absolute', top: -7, right: -9, minWidth: 18, height: 18, borderRadius: 9, background: '#FFF9F3', color: theme.color, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{cartCount}</div>
                )}
              </div>
              <span style={{ fontSize: 16, fontWeight: 800 }}>¥{cartTotal}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{barLabel} ›</span>
          </div>
        </div>
      )}
    </PhoneFrame>
  )
}

function CustomerMenu({ store, theme }: { store: Store; theme: MenuTheme }) {
  const { s, d } = store
  const items = MENU.filter((m) => m.cat === s.cCat)
  const cats = CAT_KEYS.filter((k) => k !== 'all') as Exclude<CatKey, 'all'>[]
  const pat = patternBackground(theme.pattern)
  // Round "add" button, tinted with the theme color, reused across layouts.
  const plus = (id: string, size: number) => (
    <div
      onClick={(e) => { e.stopPropagation(); store.addToCart(id, 1) }}
      style={{ width: size, height: size, borderRadius: '50%', background: theme.color, color: '#FFF9F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.64), fontWeight: 600, cursor: 'pointer', lineHeight: 0, flex: 'none' }}
    >+</div>
  )
  return (
    <div>
      <div style={{ background: theme.color, color: '#FFF9F3', padding: '22px 24px 26px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: pat.backgroundImage, backgroundSize: pat.backgroundSize, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: '#FFF9F3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/assets/m-tray.png" style={{ width: 52, height: 52, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{d.restName}</div>
              <div style={{ fontSize: 12.5, color: '#E7D8CA', marginTop: 2 }}>{d.cWelcome}</div>
            </div>
          </div>
          <div onClick={store.toggleLang} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,249,243,.16)', borderRadius: 11, padding: '7px 11px', cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
            <Icon type="globe" size={16} color="#FFF9F3" />{s.lang === 'zh' ? 'EN' : '中文'}
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,249,243,.16)', borderRadius: 11, padding: '8px 14px', fontSize: 13.5, fontWeight: 700 }}>
          <Icon type="pin" size={16} color="#FFF9F3" /> {d.cTable} {s.table}
        </div>
      </div>

      <div className="mm-scroll" style={{ position: 'sticky', top: 0, background: '#FFF9F3', zIndex: 10, display: 'flex', gap: 8, padding: '14px 18px', overflowX: 'auto', borderBottom: '1px solid #F2E9DD' }}>
        {cats.map((k) => {
          const active = s.cCat === k
          return (
            <div key={k} onClick={() => store.setCustCat(k)} style={{ flex: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '7px 15px', borderRadius: 16, background: active ? theme.color : 'transparent', color: active ? '#FFF9F3' : '#A1887F', whiteSpace: 'nowrap' }}>{catLabel(d, k)}</div>
          )
        })}
      </div>

      <div style={{ padding: '6px 22px 30px' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#5C463A', margin: '16px 0 6px' }}>{catLabel(d, s.cCat)}</div>

        {theme.layout === 'list' && items.map((m) => (
          <div key={m.id} onClick={() => store.openDetail(m.id)} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid #F4EEE5', cursor: 'pointer' }}>
            <div style={{ width: 76, height: 76, borderRadius: 16, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon type={m.icon} size={40} color="#A07E63" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#5C463A' }}>{store.nm(m)}</div>
              <div style={{ fontSize: 12.5, color: '#A1887F', marginTop: 5, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{store.L(m.dzh, m.den)}</div>
              <div style={{ fontSize: 12, color: '#C4B3A3', marginTop: 6 }}>{d.soldLab} {m.sold}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flex: 'none' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: theme.color }}>¥{m.price}</div>
              {plus(m.id, 34)}
            </div>
          </div>
        ))}

        {theme.layout === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10 }}>
            {items.map((m) => (
              <div key={m.id} onClick={() => store.openDetail(m.id)} style={{ background: '#FFFFFF', border: '1px solid #F2E9DD', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 6px 18px -14px rgba(92,74,61,.5)' }}>
                <div style={{ height: 150, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon type={m.icon} size={64} color="#A07E63" />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontSize: 16.5, fontWeight: 700, color: '#5C463A' }}>{store.nm(m)}</div>
                    <div style={{ fontSize: 16.5, fontWeight: 800, color: theme.color, flex: 'none' }}>¥{m.price}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#A1887F', marginTop: 6, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{store.L(m.dzh, m.den)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#C4B3A3' }}>{d.soldLab} {m.sold}</div>
                    {plus(m.id, 34)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {theme.layout === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
            {items.map((m) => (
              <div key={m.id} onClick={() => store.openDetail(m.id)} style={{ background: '#FFFFFF', border: '1px solid #F2E9DD', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: 96, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon type={m.icon} size={42} color="#A07E63" />
                </div>
                <div style={{ padding: '10px 11px 12px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#5C463A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.nm(m)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: theme.color }}>¥{m.price}</div>
                    {plus(m.id, 28)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CustomerDetail({ store, theme }: { store: Store; theme: MenuTheme }) {
  const { s, d } = store
  const dm = s.detailId ? store.find(s.detailId)! : MENU[0]
  return (
    <div>
      <div style={{ position: 'relative', height: 280, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: 'scale(2.4)' }}><Icon type={dm.icon} size={70} color="#A07E63" /></div>
        <div onClick={store.cBackMenu} style={{ position: 'absolute', top: 18, left: 20, width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,249,243,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon type="back" size={22} />
        </div>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#5C463A', letterSpacing: '-.5px' }}>{store.nm(dm)}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: theme.color }}>¥{dm.price}</div>
        </div>
        <div style={{ fontSize: 12.5, color: '#C4B3A3', marginTop: 8 }}>{d.soldLab} {dm.sold}{'   '}{d.likeLab} {dm.like}</div>
        <div style={{ fontSize: 14.5, color: '#6B5447', lineHeight: 1.7, marginTop: 18 }}>{store.L(dm.dzh, dm.den)}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 26 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: '#5C463A' }}>{d.cQty}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div onClick={store.detailDec} style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #EAD9C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#8B6E5C', cursor: 'pointer', lineHeight: 0 }}>−</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#5C463A', minWidth: 22, textAlign: 'center' }}>{s.detailQty}</div>
            <div onClick={store.detailInc} style={{ width: 38, height: 38, borderRadius: '50%', background: '#97785F', color: '#FFF9F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'pointer', lineHeight: 0 }}>+</div>
          </div>
        </div>
        <div onClick={() => store.addToCart(dm.id, s.detailQty)} style={{ ...primaryBar, background: theme.color, marginTop: 28, height: 56, borderRadius: 16, justifyContent: 'center', gap: 10, fontSize: 16, fontWeight: 700 }}>
          {d.cToCart} · ¥{dm.price * s.detailQty}
        </div>
      </div>
    </div>
  )
}

function CustomerCart({ store }: { store: Store }) {
  const { s, d } = store
  return (
    <div style={{ padding: '0 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 22px 18px' }}>
        <div onClick={store.cBackMenu} style={{ width: 42, height: 42, borderRadius: 14, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon type="back" size={22} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#5C463A' }}>{d.cartTitle}</div>
        <div style={{ width: 42 }} />
      </div>
      <div style={{ display: 'inline-flex', margin: '0 22px', alignItems: 'center', gap: 7, background: '#F6EFE6', borderRadius: 11, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#8B6E5C' }}>
        <Icon type="pin" size={16} color="#8B6E5C" /> {d.cTable} {s.table}
      </div>

      {s.cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 22px', color: '#A1887F' }}>
          <img src="/assets/m-cook.png" alt="" style={{ width: 150, height: 150, objectFit: 'contain' }} />
          <div style={{ fontSize: 15, marginTop: 10 }}>{d.cEmpty}</div>
        </div>
      ) : (
        <div style={{ padding: '18px 22px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {s.cart.map((ci) => {
            const m = store.find(ci.id)!
            return (
              <div key={ci.id} style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
                <div style={{ width: 58, height: 58, borderRadius: 14, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon type={m.icon} size={30} color="#A07E63" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: '#5C463A' }}>{store.nm(m)}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#8B6E5C', marginTop: 5 }}>¥{m.price * ci.qty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div onClick={() => store.decCart(m.id)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #EAD9C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color: '#8B6E5C', cursor: 'pointer', lineHeight: 0 }}>−</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#5C463A', minWidth: 18, textAlign: 'center' }}>{ci.qty}</div>
                  <div onClick={() => store.incCart(m.id)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#97785F', color: '#FFF9F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, cursor: 'pointer', lineHeight: 0 }}>+</div>
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8B6E5C', marginBottom: 9 }}>{d.cNoteLab}</div>
            <div style={{ minHeight: 54, background: '#F6EFE6', borderRadius: 14, padding: '13px 15px', fontSize: 13.5, color: '#C4B3A3', lineHeight: 1.5 }}>{d.cNotePh}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function CustomerSuccess({ store }: { store: Store }) {
  const { s, d } = store
  const lastOrder = s.orders.find((o) => o.id === s.lastOrderId)
  const status: OrderStatus = lastOrder?.status ?? 'new'
  const step = status === 'new' ? 1 : status === 'making' ? 2 : 3
  const steps = [
    { k: 1, label: d.tNew, sub: d.tNewSub },
    { k: 2, label: d.tMaking, sub: d.tMakingSub },
    { k: 3, label: d.tDone, sub: d.tDoneSub },
  ]
  return (
    <div style={{ padding: '20px 24px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: 700 }}>
      <img src="/assets/m-tablet.png" alt="" style={{ width: 140, height: 140, objectFit: 'contain', marginTop: 14 }} />
      <div style={{ fontSize: 26, fontWeight: 800, color: '#5C463A', marginTop: 8 }}>{d.placedTitle}</div>
      <div style={{ fontSize: 14.5, color: '#A1887F', marginTop: 10 }}>{d.placedSub}</div>

      <div style={{ width: '100%', background: '#F6EFE6', borderRadius: 20, padding: 24, marginTop: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#5C463A', textAlign: 'left', marginBottom: 22 }}>{d.trackTitle}</div>
        {steps.map((st, i) => {
          const active = st.k <= step
          const last = i === 2
          return (
            <div key={st.k} style={{ display: 'flex', alignItems: 'flex-start', gap: 15, textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: active ? '#8B6E5C' : '#E7DAC9', color: active ? '#FFF9F3' : '#A1887F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{st.k}</div>
                <div style={{ width: 2, height: last ? 0 : 30, background: st.k < step ? '#8B6E5C' : '#E7DAC9' }} />
              </div>
              <div style={{ paddingBottom: last ? 0 : 18 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: active ? '#5C463A' : '#A1887F' }}>{st.label}</div>
                <div style={{ fontSize: 12, color: '#C4B3A3', marginTop: 2 }}>{st.sub}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ width: '100%', background: '#FFFFFF', border: '1px solid #F2E9DD', borderRadius: 18, padding: 18, marginTop: 18, textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#5C463A', marginBottom: 12 }}>{d.yourOrder}</div>
        {(lastOrder?.items ?? []).map(([zh, en, q], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#6B5447', padding: '4px 0' }}>
            <span>{store.L(zh, en)}</span>
            <span style={{ fontWeight: 700, color: '#5C463A' }}>{d.portions} {q}</span>
          </div>
        ))}
      </div>

      <div onClick={store.cBackMenu} style={{ ...primaryBar, width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', fontSize: 16, fontWeight: 700, marginTop: 24 }}>{d.backMenu}</div>
    </div>
  )
}
