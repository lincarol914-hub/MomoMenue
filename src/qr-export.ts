import QRCode from 'qrcode'
import type { Table } from './data'

/** Base ordering URL of this deployment, e.g. https://momomenu.vercel.app/ */
export function appBaseUrl(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${window.location.pathname}`
}

/** The scan URL for a given table, e.g. https://…/?table=01 */
export function tableLink(base: string, tableId: string): string {
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}table=${encodeURIComponent(tableId)}`
}

const CARD = { w: 440, h: 560, qr: 300 }

/** Draw one printable table card (restaurant name, table no., QR, hint) to a canvas. */
async function renderCard(restName: string, tableName: string, link: string): Promise<HTMLCanvasElement> {
  const qr = document.createElement('canvas')
  await QRCode.toCanvas(qr, link, { width: CARD.qr, margin: 1, color: { dark: '#5C463A', light: '#FFFFFF' } })

  const c = document.createElement('canvas')
  c.width = CARD.w
  c.height = CARD.h
  const ctx = c.getContext('2d')!

  ctx.fillStyle = '#FFF9F3'
  ctx.fillRect(0, 0, CARD.w, CARD.h)
  ctx.strokeStyle = '#EAD9C7'
  ctx.lineWidth = 2
  roundRect(ctx, 12, 12, CARD.w - 24, CARD.h - 24, 28)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#8B6E5C'
  ctx.font = '700 30px "Plus Jakarta Sans", "Noto Sans SC", sans-serif'
  ctx.fillText(restName, CARD.w / 2, 78)

  ctx.fillStyle = '#5C463A'
  ctx.font = '800 46px "Plus Jakarta Sans", "Noto Sans SC", sans-serif'
  ctx.fillText(tableName, CARD.w / 2, 138)

  const qx = (CARD.w - CARD.qr) / 2
  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, qx - 16, 168, CARD.qr + 32, CARD.qr + 32, 20)
  ctx.fill()
  ctx.drawImage(qr, qx, 184, CARD.qr, CARD.qr)

  ctx.fillStyle = '#A1887F'
  ctx.font = '500 22px "Plus Jakarta Sans", "Noto Sans SC", sans-serif'
  ctx.fillText('扫码点餐 · Scan to order', CARD.w / 2, 530)

  return c
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

/** Download a single table's QR card as a PNG. */
export async function downloadTableQr(restName: string, base: string, table: Table) {
  const card = await renderCard(restName, table.name, tableLink(base, table.id))
  downloadCanvas(card, `MomoMenu-${table.name}.png`)
}

/** Download one printable sheet (grid) with every table's QR card as a single PNG. */
export async function downloadAllQr(restName: string, base: string, tables: Table[]) {
  if (!tables.length) return
  const cols = 2
  const rows = Math.ceil(tables.length / cols)
  const pad = 24
  const sheet = document.createElement('canvas')
  sheet.width = cols * CARD.w + (cols + 1) * pad
  sheet.height = rows * CARD.h + (rows + 1) * pad
  const ctx = sheet.getContext('2d')!
  ctx.fillStyle = '#ECE3D8'
  ctx.fillRect(0, 0, sheet.width, sheet.height)

  for (let i = 0; i < tables.length; i++) {
    const card = await renderCard(restName, tables[i].name, tableLink(base, tables[i].id))
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = pad + col * (CARD.w + pad)
    const y = pad + row * (CARD.h + pad)
    ctx.drawImage(card, x, y)
  }
  downloadCanvas(sheet, 'MomoMenu-桌台二维码.png')
}
