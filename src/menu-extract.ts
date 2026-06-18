import type { CatKey, Dish, IconType } from './data'

export interface ExtractedDish {
  name: string
  price: number
  category: CatKey
  description: string
}

/** Upload a menu image and get back the recognized dishes. */
export async function extractMenu(file: File): Promise<ExtractedDish[]> {
  const upload = await compressImage(file)
  // Serverless request-body limit is ~4.5MB; stop early with a clear message.
  if (upload.size > 4_300_000) {
    throw new Error('图片实在太大、压缩后仍超限,请换一张普通手机照片或截图。')
  }
  const form = new FormData()
  form.append('file', upload, upload instanceof File ? upload.name : 'menu.jpg')
  const res = await fetch('/api/extract-menu', { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || '识别失败，请换一张更清晰的菜单图再试。')
  }
  return (data.dishes ?? []) as ExtractedDish[]
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
