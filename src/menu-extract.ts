import type { CatKey, Dish, IconType } from './data'

export interface ExtractedDish {
  name: string
  price: number
  category: CatKey
  description: string
}

/** Upload an image or PDF of a menu and get back the recognized dishes. */
export async function extractMenu(file: File): Promise<ExtractedDish[]> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/extract-menu', { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || '识别失败，请稍后重试。')
  }
  return (data.dishes ?? []) as ExtractedDish[]
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
