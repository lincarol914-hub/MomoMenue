import type { CSSProperties, ReactNode } from 'react'
import type { IconType } from '../data'

interface IconProps {
  type: IconType
  size?: number
  color?: string
  style?: CSSProperties
}

/**
 * Line-art SVG icon set, ported from the MomoMenu prototype's `ic()` helper.
 * Strokes use currentColor so callers control the color via `color`.
 */
export function Icon({ type, size = 34, color, style }: IconProps) {
  const wrapStyle: CSSProperties = { color: color ?? '#8B6E5C', display: 'inline-flex', ...style }
  return <span style={wrapStyle}>{svg(type, size)}</span>
}

function svg(type: IconType, size: number): ReactNode {
  const common = {
    viewBox: '0 0 48 48',
    width: size,
    height: size,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return <svg {...common}>{paths(type)}</svg>
}

function paths(type: IconType): ReactNode {
  const p = (d: string, key?: string) => <path d={d} key={key ?? d.slice(0, 6)} />
  const c = (cx: number, cy: number, r: number, key?: string) => (
    <circle cx={cx} cy={cy} r={r} key={key ?? `c${cx}${cy}`} />
  )
  switch (type) {
    case 'noodle':
      return [p('M9 21h30'), p('M11 21l2.2 13.6a4 4 0 0 0 3.95 3.4h13.7a4 4 0 0 0 3.95-3.4L37 21'), p('M18 21c0-7 1.5-10 6-10s6 3 6 10'), p('M15 8l7 9'), p('M33 6l-6 11')]
    case 'chicken':
      return [c(24, 26, 12), p('M17 23h.01'), p('M24 21h.01'), p('M31 24h.01'), p('M20 30h.01'), p('M28 30h.01'), p('M12 18l4 3'), p('M36 18l-4 3')]
    case 'soup':
      return [p('M10 23h28'), p('M12 23l2 12a4 4 0 0 0 3.95 3.3h12.1a4 4 0 0 0 3.95-3.3L36 23'), p('M20 9c-2 2.5 2 4 0 6.5'), p('M28 9c-2 2.5 2 4 0 6.5')]
    case 'veg':
      return [c(24, 25, 12), p('M18 26c2-4.5 7-5.5 13-4'), p('M22 21l-2-3'), p('M28 22l2-3'), p('M19 30h.01'), p('M29 30h.01')]
    case 'rice':
      return [p('M11 22h26'), p('M13 22l2.2 13a4 4 0 0 0 3.95 3.4h9.7a4 4 0 0 0 3.95-3.4L35 22'), p('M17 22c1-4.5 4-6.5 7-6.5s6 2 7 6.5'), p('M21 16h.01'), p('M24 14h.01'), p('M27 16h.01')]
    case 'bun':
      return [p('M10 30c0-7 6-12 14-12s14 5 14 12'), p('M10 30h28v2a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z'), p('M24 18v-3'), p('M18 21l-1-2.5'), p('M30 21l1-2.5')]
    case 'drink':
      return [p('M16 14h16l-1.8 22a3 3 0 0 1-3 2.8h-6.4a3 3 0 0 1-3-2.8z'), p('M18 21h12'), p('M24 8c2 1.5 1 3.5 0 5')]
    case 'bell':
      return [p('M24 10a8 8 0 0 0-8 8c0 7-3 9-3 9h22s-3-2-3-9a8 8 0 0 0-8-8z'), p('M21 36a3 3 0 0 0 6 0')]
    case 'back':
      return [p('M28 12L16 24l12 12')]
    case 'search':
      return [c(21, 21, 11), p('M30 30l8 8')]
    case 'gear':
      return [c(24, 24, 5), p('M24 8v5M24 35v5M8 24h5M35 24h5M12 12l3.5 3.5M32.5 32.5L36 36M36 12l-3.5 3.5M15.5 32.5L12 36')]
    case 'globe':
      return [c(24, 24, 13), p('M11 24h26'), p('M24 11c5 5 5 21 0 26'), p('M24 11c-5 5-5 21 0 26')]
    case 'pin':
      return [p('M24 9a10 10 0 0 0-10 10c0 7 10 18 10 18s10-11 10-18A10 10 0 0 0 24 9z'), c(24, 19, 4)]
    case 'cam':
      return [p('M14 18h4l2-3h8l2 3h4a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V21a3 3 0 0 1 3-3z'), c(24, 27, 6)]
    case 'file':
      return [p('M16 8h12l8 8v22a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z'), p('M28 8v8h8'), p('M20 26h12M20 32h8')]
    case 'spark':
      return [p('M24 10l2.8 8.4L35 21l-8.2 2.6L24 32l-2.8-8.4L13 21l8.2-2.6z')]
    case 'cart':
      return [p('M12 12h4l3 18h17l3-13H17'), c(20, 38, 2), c(34, 38, 2)]
    case 'clip':
      return [p('M18 10h12a1 1 0 0 1 1 1v2H17v-2a1 1 0 0 1 1-1z'), <rect x={11} y={11} width={26} height={30} rx={4} key="r" />, p('M18 22h12M18 29h8')]
    case 'home':
      return [p('M9 22l15-12 15 12'), p('M13 20v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V20'), p('M20 37v-9h8v9')]
    case 'menugrid':
      return [<rect x={6} y={6} width={36} height={36} rx={9} key="r" />, c(17, 18, 2.2, 'a'), c(31, 18, 2.2, 'b'), c(17, 30, 2.2, 'c'), c(31, 30, 2.2, 'd')]
    default:
      return [c(24, 24, 12)]
  }
}
