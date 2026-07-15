// Server-only Upstash Redis (Vercel KV) REST helper, shared by the API routes.
// Accepts either env-var naming so it works however the integration named them.
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''

export const kvConfigured = Boolean(REST_URL && REST_TOKEN)

/** Run one Redis command (e.g. ['GET','key']) over the Upstash REST API. */
export async function redis(command: (string | number)[]): Promise<unknown> {
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
