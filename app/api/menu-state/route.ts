export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The single "published menu" the customer ordering page reads. The merchant
// back office writes it (theme + dishes + which dishes are turned off); every
// scanned phone reads the same copy, so changes sync across devices.
//
// Storage is Upstash Redis over its REST API (this is what Vercel KV / the
// Vercel "Upstash for Redis" marketplace integration provisions). We accept
// either env-var naming so it works however the integration named them.
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''
const KEY = 'momo:menu-state'

async function redis(command: string[]): Promise<unknown> {
  const res = await fetch(REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`redis ${res.status}: ${(await res.text().catch(() => '')).slice(0, 160)}`)
  const data = (await res.json()) as { result?: unknown }
  return data.result
}

/** Read the published menu snapshot (or null if nothing published yet). */
export async function GET() {
  if (!REST_URL || !REST_TOKEN) {
    return Response.json({ configured: false, snapshot: null })
  }
  try {
    const raw = await redis(['GET', KEY])
    const snapshot = typeof raw === 'string' && raw ? JSON.parse(raw) : null
    return Response.json({ configured: true, snapshot })
  } catch (e) {
    return Response.json({ configured: true, snapshot: null, error: String(e).slice(0, 200) })
  }
}

/** Publish the menu snapshot (merchant only). Body is the snapshot JSON. */
export async function POST(req: Request) {
  if (!REST_URL || !REST_TOKEN) {
    return Response.json({ ok: false, configured: false, message: '云端同步未配置：请在 Vercel 接入 KV / Upstash Redis 后重试。' })
  }
  let body: string
  try {
    body = await req.text()
  } catch {
    return Response.json({ ok: false, message: '请求体无效。' }, { status: 400 })
  }
  if (!body || body.length > 700_000) {
    return Response.json({ ok: false, message: '菜单数据为空或过大。' }, { status: 413 })
  }
  try {
    await redis(['SET', KEY, body])
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ ok: false, message: String(e).slice(0, 200) }, { status: 502 })
  }
}
