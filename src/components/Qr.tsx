interface QrProps {
  seed: number
  px: number
  color?: string
}

/**
 * Deterministic decorative "QR" code, ported from the prototype's `qr()` helper.
 * It is not a scannable code — it renders a stable 15x15 pattern with the three
 * finder squares, seeded so each table looks distinct but consistent.
 */
export function Qr({ seed, px, color = '#5C463A' }: QrProps) {
  const n = 15
  let s = (seed * 2654435761) >>> 0
  const rnd = () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >> 17
    s ^= s << 5
    s >>>= 0
    return (s % 1000) / 1000
  }
  const inBox = (r: number, col: number, R: number, C: number) => r >= R && r < R + 5 && col >= C && col < C + 5
  const finder = (r: number, col: number) => {
    const ring = (R: number, C: number) =>
      inBox(r, col, R, C) && (r === R || r === R + 4 || col === C || col === C + 4 || (r >= R + 2 && r <= R + 2 && col >= C + 2 && col <= C + 2))
    return ring(0, 0) || ring(0, n - 5) || ring(n - 5, 0)
  }
  const quiet = (r: number, col: number) => inBox(r, col, 0, 0) || inBox(r, col, 0, n - 5) || inBox(r, col, n - 5, 0)

  const cells: JSX.Element[] = []
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const on = quiet(r, col) ? finder(r, col) : rnd() > 0.5
      cells.push(<div key={`${r}-${col}`} style={{ background: on ? color : 'transparent' }} />)
    }
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, width: px, height: px }}>
      {cells}
    </div>
  )
}
