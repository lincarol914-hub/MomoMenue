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
  const form = new FormData()
  form.append('file', upload, upload instanceof File ? upload.name : 'menu.jpg')
  const res = await fetch('/api/extract-menu', { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || '识别失败，请换一张更清晰的菜单图再试。')
  }
  return (data.dishes ?? []) as ExtractedDish[]
}

/**
 * Downscale + re-encode a phone photo to JPEG before upload, so it stays well
 * under the serverless request-body limit and the model responds faster.
 * Falls back to the original file if anything goes wrong or it's not an image.
 */
async function compressImage(file: File, maxEdge = 1600, quality = 0.82): Promise<Blob> {
  if (typeof document === 'undefined' || !file.type.startsWith('image/')) return file
  try {
    const url = URL.createObjectURL(file)
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = reject
      im.src = url
    })
    URL.revokeObjectURL(url)
    const longest = Math.max(img.width, img.height)
    const scale = longest > maxEdge ? maxEdge / longest : 1
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))
    // Keep whichever is smaller (tiny images may not benefit from re-encoding).
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
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
