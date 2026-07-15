import { kvConfigured, redis } from '@/src/server/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Shared order store: a Redis hash with one field per order id. Customers POST
// their order when they submit; the merchant polls GET and POSTs back status
// changes (the full updated order). Field-per-order means a new order and a
// status update can land concurrently without clobbering each other.
const KEY = 'momo:orders'

/** GET → all orders; GET ?id=xxx → that single order (customer status page). */
export async function GET(req: Request) {
  if (!kvConfigured) return Response.json({ configured: false, orders: [] })
  const id = new URL(req.url).searchParams.get('id')
  try {
    if (id) {
      const raw = await redis(['HGET', KEY, id])
      const order = typeof raw === 'string' && raw ? JSON.parse(raw) : null
      return Response.json({ configured: true, orders: order ? [order] : [] })
    }
    const raw = (await redis(['HVALS', KEY])) as unknown
    const orders = Array.isArray(raw)
      ? raw.flatMap((v) => {
          try { return [JSON.parse(String(v))] } catch { return [] }
        })
      : []
    return Response.json({ configured: true, orders })
  } catch (e) {
    return Response.json({ configured: true, orders: [], error: String(e).slice(0, 200) })
  }
}

/** POST an order (new, or an updated copy after a status change). */
export async function POST(req: Request) {
  if (!kvConfigured) {
    return Response.json({ ok: false, configured: false, message: '云端同步未配置：请在 Vercel 接入 KV / Upstash Redis。' })
  }
  let order: { id?: unknown; table?: unknown; items?: unknown } | null = null
  try {
    order = await req.json()
  } catch {
    return Response.json({ ok: false, message: '请求体不是有效 JSON。' }, { status: 400 })
  }
  if (!order || typeof order.id !== 'string' || !order.id || !Array.isArray(order.items)) {
    return Response.json({ ok: false, message: '订单数据不完整。' }, { status: 400 })
  }
  const body = JSON.stringify(order)
  if (body.length > 32_000) {
    return Response.json({ ok: false, message: '订单数据过大。' }, { status: 413 })
  }
  try {
    await redis(['HSET', KEY, order.id, body])
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ ok: false, message: String(e).slice(0, 200) }, { status: 502 })
  }
}
