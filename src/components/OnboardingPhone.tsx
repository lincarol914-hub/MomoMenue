'use client'

import { useState } from 'react'
import { appBaseUrl, downloadTableQr, tableLink } from '../qr-export'
import { markOnboarded } from '../onboarding-state'
import { Icon } from './Icon'
import { PhoneFrame } from './PhoneFrame'
import { QrCode } from './QrCode'

type Lang = 'zh' | 'en'
type Phase = 'welcome' | 'wizard'

interface Slide { tint: string; img: string; title: string; body: string; cta: string; step: string }
interface Dict {
  skip: string
  slides: Slide[]
  s1Kicker: string; s1Title: string; s1Sub: string; s1Logo: string; s1Name: string; s1Type: string; s1Addr: string; s1AddrPh: string
  s2Kicker: string; s2Title: string; s2Sub: string; s2Tip: string; s2Later: string
  s3Kicker: string; s3Title: string; s3Sub: string; s3Count: string; s3Tip: string
  s4Kicker: string; s4Title: string; s4Sub: string; s4Table: string; s4Scan: string; s4Save: string; s4Print: string; s4More: string
  s5Title: string; s5Sub: string
  restName: string
  sumName: string; sumMenu: string; sumTable: string; sumQr: string; sumMenuVal: string; sumQrVal: string
  ctaNext: string; ctaDone: string
  types: string[]
  imp: { title: string; sub: string }[]
  tablesUnit: string
}

const ICONS = ['onb-welcome.png', 'onb-menu.png', 'onb-qr.png']
const TINTS = ['#F5E6D8', '#EAE0CF', '#E7DAD0']

const ZH: Dict = {
  skip: '跳过',
  slides: [
    { tint: TINTS[0], img: ICONS[0], title: '欢迎来到 MomoMenu', body: '专为小餐馆打造的扫码点餐系统，几分钟就能让顾客扫码自助下单。', cta: '开始吧', step: '1 / 3' },
    { tint: TINTS[1], img: ICONS[1], title: '菜单一键导入', body: '手动添加、上传 Excel／Word／PDF，或直接拍张纸质菜单，AI 帮你自动生成。', cta: '下一步', step: '2 / 3' },
    { tint: TINTS[2], img: ICONS[2], title: '生成专属二维码', body: '每张桌台一个二维码，顾客扫码点餐，订单实时进入你的后台。', cta: '立即设置', step: '3 / 3' },
  ],
  s1Kicker: '第 1 步 · 餐厅信息', s1Title: '介绍一下你的店', s1Sub: '这些信息会展示在顾客点餐页顶部。', s1Logo: '上传 Logo', s1Name: '餐厅名称', s1Type: '餐厅类型', s1Addr: '地址（选填）', s1AddrPh: '例如：xx 路 88 号',
  s2Kicker: '第 2 步 · 导入菜单', s2Title: '把菜单搬进来', s2Sub: '选一种最方便的方式，先建一份就能随时改。', s2Tip: '上传文件或拍照时，AI 会自动识别菜名与价格，省去逐个录入。', s2Later: '暂时跳过，稍后再建 ›',
  s3Kicker: '第 3 步 · 桌台数量', s3Title: '你有几张桌台？', s3Sub: '我们会按数量为每张桌台生成独立二维码。', s3Count: '桌台数量', s3Tip: '之后还能在「桌台管理」里增删、命名分区（如大厅 / 包间）。',
  s4Kicker: '第 4 步 · 生成二维码', s4Title: '你的第一个二维码', s4Sub: '放到桌上，顾客扫码即可点餐。', s4Table: '桌号', s4Scan: '扫码即可点餐', s4Save: '保存图片', s4Print: '打印', s4More: '其余桌台二维码已自动生成 ✓',
  s5Title: '全部搞定！', s5Sub: '你的扫码点餐系统已就绪，现在就能接待第一桌客人。',
  restName: 'Momo小馆',
  sumName: '餐厅名称', sumMenu: '菜单', sumTable: '桌台', sumQr: '二维码', sumMenuVal: '已导入', sumQrVal: '已生成',
  ctaNext: '下一步', ctaDone: '完成，进入后台',
  types: ['面馆', '快餐', '火锅', '咖啡', '烧烤', '其他'],
  imp: [{ title: '手动添加', sub: '一道一道录入，最灵活' }, { title: '上传文件', sub: 'Excel / Word / PDF 批量导入' }, { title: '拍照识别', sub: '对着纸质菜单拍一张' }],
  tablesUnit: ' 张',
}

const EN: Dict = {
  skip: 'Skip',
  slides: [
    { tint: TINTS[0], img: ICONS[0], title: 'Welcome to MomoMenu', body: 'Scan-to-order built for small restaurants — get guests self-ordering in minutes.', cta: 'Get started', step: '1 / 3' },
    { tint: TINTS[1], img: ICONS[1], title: 'Import your menu in one tap', body: 'Add by hand, upload Excel/Word/PDF, or snap a paper menu — AI builds it for you.', cta: 'Next', step: '2 / 3' },
    { tint: TINTS[2], img: ICONS[2], title: 'Generate your QR codes', body: 'One QR per table. Guests scan to order, and orders land in your dashboard live.', cta: 'Set up now', step: '3 / 3' },
  ],
  s1Kicker: 'Step 1 · Restaurant info', s1Title: 'Tell us about your place', s1Sub: 'Shown at the top of the customer ordering page.', s1Logo: 'Upload logo', s1Name: 'Restaurant name', s1Type: 'Type', s1Addr: 'Address (optional)', s1AddrPh: 'e.g. 88 Main Street',
  s2Kicker: 'Step 2 · Import menu', s2Title: 'Bring your menu in', s2Sub: 'Pick whatever is easiest — you can edit anytime.', s2Tip: 'On upload or photo, AI auto-detects dish names and prices so you skip manual entry.', s2Later: 'Skip for now, build later ›',
  s3Kicker: 'Step 3 · Tables', s3Title: 'How many tables?', s3Sub: 'We generate a unique QR code for each one.', s3Count: 'Number of tables', s3Tip: 'You can add, remove and group tables (Hall / Private) later in Table management.',
  s4Kicker: 'Step 4 · Generate QR', s4Title: 'Your first QR code', s4Sub: 'Put it on the table — guests scan to order.', s4Table: 'Table', s4Scan: 'Scan to order', s4Save: 'Save image', s4Print: 'Print', s4More: 'QR codes for all other tables generated ✓',
  s5Title: 'All set!', s5Sub: 'Your scan-to-order system is ready. You can welcome your first table right now.',
  restName: 'Momo Diner',
  sumName: 'Name', sumMenu: 'Menu', sumTable: 'Tables', sumQr: 'QR codes', sumMenuVal: 'Imported', sumQrVal: 'Generated',
  ctaNext: 'Next', ctaDone: 'Done — enter dashboard',
  types: ['Noodles', 'Fast food', 'Hotpot', 'Café', 'BBQ', 'Other'],
  imp: [{ title: 'Add manually', sub: 'One by one — most flexible' }, { title: 'Upload file', sub: 'Bulk import Excel / Word / PDF' }, { title: 'Photo scan', sub: 'Snap your paper menu' }],
  tablesUnit: '',
}

const primaryBtn = {
  background: '#97785F', color: '#FFF9F3', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 24px -12px rgba(151,120,95,.7)',
} as const

const IMPORT_META = [
  { icon: 'edit' as const, iconBg: '#F0E0CE' },
  { icon: 'file' as const, iconBg: '#E3E8D8' },
  { icon: 'cam' as const, iconBg: '#E6DEEC' },
]
const PRESETS = [4, 8, 12, 20]

/** Enter the real back office (merchant home), the destination after onboarding. */
function enterApp() {
  markOnboarded()
  window.location.assign('/?view=home')
}

export function OnboardingPhone() {
  const [lang, setLang] = useState<Lang>('zh')
  const [phase, setPhase] = useState<Phase>('welcome')
  const [slide, setSlide] = useState(0)
  const [step, setStep] = useState(1)
  const [restType, setRestType] = useState(0)
  const [importMethod, setImportMethod] = useState(0)
  const [tables, setTables] = useState(8)
  const d = lang === 'zh' ? ZH : EN

  const langToggle = (
    <div onClick={() => setLang((l) => (l === 'zh' ? 'en' : 'zh'))} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F6EFE6', borderRadius: 11, padding: '6px 11px', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: '#8B6E5C' }}>
      <Icon type="globe" size={16} color="#8B6E5C" />{lang === 'zh' ? 'EN' : '中文'}
    </div>
  )

  const nextSlide = () => (slide >= 2 ? (setPhase('wizard'), setStep(1)) : setSlide(slide + 1))
  const skipWelcome = () => { setPhase('wizard'); setStep(1) }
  const wizNext = () => (step >= 5 ? enterApp() : setStep(step + 1))
  const wizBack = () => { if (step <= 1) { setPhase('welcome'); setSlide(2) } else setStep(step - 1) }

  return (
    <PhoneFrame fullscreen topRight={langToggle}>
      {phase === 'welcome' ? (
        <WelcomeCarousel d={d} slide={slide} onNext={nextSlide} onSkip={skipWelcome} />
      ) : (
        <Wizard
          d={d} lang={lang} step={step} restType={restType} importMethod={importMethod} tables={tables}
          setRestType={setRestType} setImportMethod={setImportMethod} setTables={setTables}
          onBack={wizBack} onNext={wizNext}
        />
      )}
    </PhoneFrame>
  )
}

function WelcomeCarousel({ d, slide, onNext, onSkip }: { d: Dict; slide: number; onNext: () => void; onSkip: () => void }) {
  const s = d.slides[slide]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 26px' }}>
        <div onClick={onSkip} style={{ fontSize: 14, fontWeight: 700, color: '#A1887F', cursor: 'pointer' }}>{d.skip}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px' }}>
        <div style={{ width: 280, height: 280, borderRadius: '50%', background: s.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .3s' }}>
          <img src={`/assets/${s.img}`} alt="" style={{ width: 212, height: 212, objectFit: 'contain' }} />
        </div>
        <div style={{ fontSize: 27, fontWeight: 800, color: '#5C463A', marginTop: 42, letterSpacing: '-.5px' }}>{s.title}</div>
        <div style={{ fontSize: 15, color: '#A1887F', lineHeight: 1.6, marginTop: 14, maxWidth: 268 }}>{s.body}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '10px 0 6px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 8, width: i === slide ? 22 : 8, borderRadius: 4, background: i === slide ? '#97785F' : '#DCC9B5', transition: 'all .3s' }} />
        ))}
      </div>
      <div style={{ padding: '18px 30px 34px' }}>
        <div onClick={onNext} style={{ ...primaryBtn, height: 60, borderRadius: 20, fontSize: 18 }}>{s.cta}</div>
      </div>
    </div>
  )
}

interface WizardProps {
  d: Dict; lang: Lang; step: number; restType: number; importMethod: number; tables: number
  setRestType: (n: number) => void; setImportMethod: (n: number) => void; setTables: (n: number) => void
  onBack: () => void; onNext: () => void
}

function Wizard({ d, lang, step, restType, importMethod, tables, setRestType, setImportMethod, setTables, onBack, onNext }: WizardProps) {
  const tip = (text: string) => (
    <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 18, background: '#F6EFE6', borderRadius: 14, padding: 14 }}>
      <div style={{ flex: 'none', color: '#C0703F' }}><Icon type="spark" size={22} color="#C0703F" /></div>
      <div style={{ fontSize: 13, color: '#8B6E5C', lineHeight: 1.5 }}>{text}</div>
    </div>
  )
  const heading = (kicker: string, title: string, sub: string) => (
    <>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#C0703F', letterSpacing: '.5px' }}>{kicker}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#5C463A', marginTop: 8, letterSpacing: '-.5px' }}>{title}</div>
      <div style={{ fontSize: 14.5, color: '#A1887F', marginTop: 10, lineHeight: 1.5 }}>{sub}</div>
    </>
  )
  const field = (text: string, placeholder: boolean) => (
    <div style={{ height: 56, background: '#F6EFE6', borderRadius: 15, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: placeholder ? 15 : 16, color: placeholder ? '#C4B3A3' : '#5C463A', fontWeight: placeholder ? 400 : 600 }}>{text}</div>
  )

  return (
    <>
      <div style={{ flex: 'none', padding: '6px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div onClick={onBack} style={{ width: 40, height: 40, borderRadius: 13, background: '#F6EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
            <Icon type="back" size={22} />
          </div>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#EBDFCF', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / 5) * 100}%`, borderRadius: 4, background: '#97785F', transition: 'width .35s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#8B6E5C', flex: 'none' }}>{step}/5</div>
        </div>
      </div>

      <div className="mm-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        {step === 1 && (
          <div style={{ paddingTop: 24, paddingBottom: 20 }}>
            {heading(d.s1Kicker, d.s1Title, d.s1Sub)}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 28 }}>
              <div style={{ width: 96, height: 96, borderRadius: 28, background: '#F6EFE6', border: '1.6px dashed #D8C4B2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer', color: '#B8A593' }}>
                <Icon type="cam" size={26} color="#B8A593" /><span style={{ fontSize: 11, fontWeight: 600 }}>{d.s1Logo}</span>
              </div>
            </div>
            <div style={{ marginTop: 26, fontSize: 13, fontWeight: 700, color: '#8B6E5C', marginBottom: 9 }}>{d.s1Name}</div>
            {field(d.restName, false)}
            <div style={{ marginTop: 20, fontSize: 13, fontWeight: 700, color: '#8B6E5C', marginBottom: 9 }}>{d.s1Type}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {d.types.map((label, i) => {
                const on = restType === i
                return (
                  <div key={i} onClick={() => setRestType(i)} style={{ cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '10px 16px', borderRadius: 14, background: on ? '#8B6E5C' : '#FFFFFF', color: on ? '#FFF9F3' : '#8B6E5C', border: on ? 'none' : '1.5px solid #EAD9C7' }}>{label}</div>
                )
              })}
            </div>
            <div style={{ marginTop: 20, fontSize: 13, fontWeight: 700, color: '#8B6E5C', marginBottom: 9 }}>{d.s1Addr}</div>
            {field(d.s1AddrPh, true)}
          </div>
        )}

        {step === 2 && (
          <div style={{ paddingTop: 24, paddingBottom: 20 }}>
            {heading(d.s2Kicker, d.s2Title, d.s2Sub)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              {d.imp.map((m, i) => {
                const on = importMethod === i
                const meta = IMPORT_META[i]
                return (
                  <div key={i} onClick={() => setImportMethod(i)} style={{ background: '#FFFFFF', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 15, border: on ? '2px solid #97785F' : '2px solid transparent', boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)', cursor: 'pointer' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: meta.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                      <Icon type={meta.icon} size={26} color="#8B6E5C" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#5C463A' }}>{m.title}</div>
                      <div style={{ fontSize: 12.5, color: '#A1887F', marginTop: 3 }}>{m.sub}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${on ? '#97785F' : '#DCC9B5'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: on ? '#97785F' : 'transparent' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            {tip(d.s2Tip)}
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <span onClick={onNext} style={{ fontSize: 14, fontWeight: 700, color: '#A1887F', cursor: 'pointer' }}>{d.s2Later}</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ paddingTop: 24, paddingBottom: 20 }}>
            {heading(d.s3Kicker, d.s3Title, d.s3Sub)}
            <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '30px 24px', marginTop: 26, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#8B6E5C', textAlign: 'center' }}>{d.s3Count}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, marginTop: 18 }}>
                <div onClick={() => setTables(Math.max(1, tables - 1))} style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #EAD9C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#8B6E5C', cursor: 'pointer', lineHeight: 0 }}>−</div>
                <div style={{ fontSize: 54, fontWeight: 800, color: '#5C463A', minWidth: 80, textAlign: 'center', letterSpacing: '-2px' }}>{tables}</div>
                <div onClick={() => setTables(Math.min(99, tables + 1))} style={{ width: 52, height: 52, borderRadius: '50%', background: '#97785F', color: '#FFF9F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, cursor: 'pointer', lineHeight: 0 }}>+</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                {PRESETS.map((n) => (
                  <div key={n} onClick={() => setTables(n)} style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 700, padding: '8px 15px', borderRadius: 12, background: tables === n ? '#8B6E5C' : '#F6EFE6', color: tables === n ? '#FFF9F3' : '#8B6E5C' }}>{n}{lang === 'zh' ? ' 张' : ''}</div>
                ))}
              </div>
            </div>
            {tip(d.s3Tip)}
          </div>
        )}

        {step === 4 && (
          <div style={{ paddingTop: 24, paddingBottom: 20 }}>
            {heading(d.s4Kicker, d.s4Title, d.s4Sub)}
            <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 28, marginTop: 26, boxShadow: '0 8px 24px -12px rgba(139,110,92,.35)', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F6EFE6', borderRadius: 12, padding: '7px 14px', fontSize: 13, fontWeight: 800, color: '#8B6E5C' }}>
                <Icon type="pin" size={16} color="#8B6E5C" /> {d.s4Table} 01
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #F2E9DD', borderRadius: 18, padding: 18, marginTop: 18, display: 'inline-flex' }}>
                <QrCode value={tableLink(appBaseUrl(), '01')} size={168} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#5C463A', marginTop: 16 }}>{d.restName}</div>
              <div style={{ fontSize: 13, color: '#A1887F', marginTop: 4 }}>{d.s4Scan}</div>
            </div>
            <div style={{ display: 'flex', gap: 11, marginTop: 16 }}>
              <div onClick={() => downloadTableQr(d.restName, appBaseUrl(), { id: '01', name: '01', seats: 'seats4', status: 'idle' })} style={{ flex: 1, height: 50, background: '#FFFFFF', border: '1.5px solid #EAD9C7', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#8B6E5C', cursor: 'pointer' }}>
                <Icon type="download" size={20} /> {d.s4Save}
              </div>
              <div onClick={() => window.print()} style={{ flex: 1, height: 50, background: '#FFFFFF', border: '1.5px solid #EAD9C7', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#8B6E5C', cursor: 'pointer' }}>
                <Icon type="print" size={20} /> {d.s4Print}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13.5, color: '#A1887F' }}>{d.s4More}</div>
          </div>
        )}

        {step === 5 && (
          <div style={{ paddingTop: 14, paddingBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img src="/assets/onb-done.png" alt="" style={{ width: 188, height: 188, objectFit: 'contain', marginTop: 10 }} />
            <div style={{ fontSize: 28, fontWeight: 800, color: '#5C463A', marginTop: 6, letterSpacing: '-.5px' }}>{d.s5Title}</div>
            <div style={{ fontSize: 15, color: '#A1887F', marginTop: 12, lineHeight: 1.6, maxWidth: 280 }}>{d.s5Sub}</div>
            <div style={{ width: '100%', background: '#FFFFFF', borderRadius: 20, padding: '8px 18px', marginTop: 26, boxShadow: '0 4px 14px -10px rgba(139,110,92,.25)' }}>
              {[
                { label: d.sumName, value: d.restName, border: 'none' },
                { label: d.sumMenu, value: d.sumMenuVal, border: '1px solid #F2E9DD' },
                { label: d.sumTable, value: `${tables}${d.tablesUnit}`, border: '1px solid #F2E9DD' },
                { label: d.sumQr, value: d.sumQrVal, border: '1px solid #F2E9DD' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 0', borderTop: r.border }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#8B6E5C', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    <svg viewBox="0 0 48 48" width={18} height={18} fill="none" stroke="#FFF9F3" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M14 25l7 7 14-15" /></svg>
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', fontSize: 14.5, fontWeight: 600, color: '#5C463A' }}>{r.label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#8B6E5C' }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 'none', background: '#FFF9F3', padding: '14px 24px 30px', borderTop: '1px solid #F2E9DD' }}>
        <div onClick={onNext} style={{ ...primaryBtn, height: 58, borderRadius: 18, fontSize: 17 }}>{step === 5 ? d.ctaDone : d.ctaNext}</div>
      </div>
    </>
  )
}
