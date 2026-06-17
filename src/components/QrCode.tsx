import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QrCodeProps {
  /** the text encoded in the QR — here, the table's ordering URL */
  value: string
  size?: number
  fg?: string
  bg?: string
}

/** Renders a real, scannable QR code onto a canvas. */
export function QrCode({ value, size = 92, fg = '#5C463A', bg = '#FFFFFF' }: QrCodeProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    QRCode.toCanvas(canvas, value, { width: size, margin: 0, color: { dark: fg, light: bg } }).catch(() => {})
  }, [value, size, fg, bg])
  return <canvas ref={ref} style={{ width: size, height: size }} />
}
