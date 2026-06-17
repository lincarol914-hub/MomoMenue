import type { ReactNode } from 'react'

/** iOS-style status bar (signal / wifi / battery), matching the prototype chrome. */
export function StatusBar() {
  return (
    <div style={{ height: 46, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px 0 32px', fontSize: 15, fontWeight: 700, color: '#6B5447', zIndex: 20 }}>
      <span>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <svg width={18} height={13} viewBox="0 0 18 13" fill="#6B5447">
          <path d="M1 9h2v3H1zM5 6h2v6H5zM9 3.5h2V12H9zM13 1h2v11h-2z" />
        </svg>
        <svg width={17} height={13} viewBox="0 0 17 13" fill="none" stroke="#6B5447" strokeWidth={1.4}>
          <path d="M1 4.5C3.3 2.6 5.8 1.6 8.5 1.6S13.7 2.6 16 4.5" />
          <path d="M3.5 7C5 5.8 6.7 5.2 8.5 5.2S12 5.8 13.5 7" />
          <path d="M6 9.4c.8-.6 1.6-.9 2.5-.9s1.7.3 2.5.9" />
          <circle cx={8.5} cy={11.4} r={0.9} fill="#6B5447" stroke="none" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 23, height: 12, border: '1.4px solid #6B5447', borderRadius: 3, padding: 1.6 }}>
            <div style={{ width: '80%', height: '100%', background: '#6B5447', borderRadius: 1 }} />
          </div>
          <div style={{ width: 2, height: 5, background: '#6B5447', borderRadius: 1 }} />
        </div>
      </div>
    </div>
  )
}

interface PhoneFrameProps {
  label: string
  children: ReactNode
}

/** The device shell: brown bezel, cream screen, status bar, and home indicator. */
export function PhoneFrame({ label, children }: PhoneFrameProps) {
  return (
    <div style={{ flex: 'none' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#A1887F', marginBottom: 14, letterSpacing: '.3px' }}>{label}</div>
      <div style={{ position: 'relative', width: 392, height: 840, background: '#5C4A3D', borderRadius: 52, padding: 9, boxShadow: '0 40px 80px -28px rgba(92,74,61,.5)' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#FFF9F3', borderRadius: 44, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <StatusBar />
          {children}
          <div style={{ position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)', width: 128, height: 5, borderRadius: 3, background: '#6B5447', opacity: 0.6, zIndex: 30 }} />
        </div>
      </div>
    </div>
  )
}
