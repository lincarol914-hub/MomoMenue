import type { CatKey, Dish, IconType } from './data'

export interface ExtractedDish {
  name: string
  price: number
  category: CatKey
  description: string
}

/** Upload a menu image or PDF and get back the recognized dishes. */
export async function extractMenu(file: File): Promise<ExtractedDish[]> {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const pages = await pdfToImages(file)
    if (!pages.length) {
      throw new Error('无法读取该 PDF，请换成图片或截图再试。')
    }
    // Recognize pages with limited concurrency — much faster than one-by-one for
    // multi-page PDFs, while staying under the model's request-rate limit.
    const perPage = await mapLimit(pages, 3, recognizeBlob)
    return perPage.flat()
  }
  return recognizeBlob(await compressImage(file))
}

/** Run an async mapper over items, at most `limit` in flight, preserving order. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (true) {
      const i = next++
      if (i >= items.length) return
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

/** Send one image blob to the recognition API. */
async function recognizeBlob(blob: Blob): Promise<ExtractedDish[]> {
  // Serverless request-body limit is ~4.5MB; stop early with a clear message.
  if (blob.size > 4_300_000) {
    throw new Error('图片实在太大、压缩后仍超限，请换一张普通手机照片或截图。')
  }
  const form = new FormData()
  form.append('file', blob, blob instanceof File ? blob.name : 'menu.jpg')
  const res = await fetch('/api/extract-menu', { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || '识别失败，请换一张更清晰的菜单图再试。')
  }
  return (data.dishes ?? []) as ExtractedDish[]
}

/** Render each page of a PDF to a JPEG image (in the browser) for recognition. */
async function pdfToImages(file: File, maxPages = 6): Promise<Blob[]> {
  // Loaded lazily so pdf.js never runs during server-side rendering.
  const pdfjs = await import('pdfjs-dist')
  // Self-hosted worker (no CDN — reliable in mainland China).
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const out: Blob[] = []
  const pages = Math.min(pdf.numPages, maxPages)
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i)
    const base = page.getViewport({ scale: 1 })
    const scale = Math.min(2.5, Math.max(1, 1800 / Math.max(base.width, base.height)))
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    await page.render({ canvas, canvasContext: ctx, viewport }).promise
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.8))
    if (blob) out.push(blob)
  }
  return out
}

const TARGET_BYTES = 3_200_000
// Progressively smaller/lower-quality encodes until the result fits the target.
const STEPS: { edge: number; quality: number }[] = [
  { edge: 1800, quality: 0.85 },
  { edge: 1600, quality: 0.8 },
  { edge: 1280, quality: 0.72 },
  { edge: 1024, quality: 0.62 },
  { edge: 820, quality: 0.55 },
  { edge: 640, quality: 0.5 },
]

/**
 * Downscale + re-encode a (possibly very large) photo to JPEG so the upload
 * stays under the serverless body limit and the model responds faster.
 * Decodes once (memory-efficient via createImageBitmap when available), then
 * iterates encode steps until the blob is small enough. Falls back to the
 * original file if the browser can't decode it at all.
 */
async function compressImage(file: File): Promise<Blob> {
  if (typeof document === 'undefined' || !file.type.startsWith('image/')) return file
  // Already small and in an efficient format → nothing to do.
  if (file.size <= TARGET_BYTES && (file.type === 'image/jpeg' || file.type === 'image/webp')) return file

  const src = await decode(file)
  if (!src) return file
  try {
    let best: Blob | null = null
    for (const step of STEPS) {
      const blob = await encode(src, step.edge, step.quality)
      if (!blob) break
      best = blob
      if (blob.size <= TARGET_BYTES) break
    }
    // Keep the original if compression somehow produced something bigger.
    return best && best.size < file.size ? best : (best ?? file)
  } finally {
    if ('close' in src && typeof src.close === 'function') src.close()
  }
}

type Drawable = ImageBitmap | HTMLImageElement

async function decode(file: File): Promise<Drawable | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // fall through to the <img> path
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = reject
      im.src = url
    })
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function encode(src: Drawable, maxEdge: number, quality: number): Promise<Blob | null> {
  const sw = 'width' in src ? src.width : 0
  const sh = 'height' in src ? src.height : 0
  if (!sw || !sh) return null
  const longest = Math.max(sw, sh)
  const scale = longest > maxEdge ? maxEdge / longest : 1
  const w = Math.max(1, Math.round(sw * scale))
  const h = Math.max(1, Math.round(sh * scale))
  try {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(src, 0, 0, w, h)
    return await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))
  } catch {
    return null
  }
}

const ICON_BY_CAT: Record<CatKey, IconType> = {
  all: 'noodle',
  hot: 'noodle',
  cold: 'veg',
  staple: 'rice',
  soup: 'soup',
  drink: 'drink',
}

/** Convert a recognized dish into a full menu Dish, ready to add to the store. */
export function toDish(d: ExtractedDish, seq: number): Dish {
  const cat: CatKey = d.category === 'all' ? 'staple' : d.category
  return {
    id: `mx${Date.now()}_${seq}`,
    zh: d.name,
    en: d.name,
    price: Math.max(0, Math.round(d.price)),
    cat,
    sold: 0,
    like: 0,
    icon: ICON_BY_CAT[cat],
    dzh: d.description || '',
    den: d.description || '',
  }
}
