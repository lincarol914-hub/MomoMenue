import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Health check — open /api/extract-menu to verify the deployment can read the
 * env vars (never returns the key). Add ?ping=1 to make a real minimal call to
 * DashScope and report its actual status, so auth/model/endpoint issues can be
 * diagnosed without uploading an image.
 */
export async function GET(req: Request) {
  const key = process.env.DASHSCOPE_API_KEY ?? ''
  const base = (process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/+$/, '')
  const model = process.env.QWEN_VL_MODEL || 'qwen-vl-max'
  const info = { ok: true, hasKey: key.length > 0, keyLen: key.length, keyPrefix: key ? key.slice(0, 3) : '', base, model }

  const ping = new URL(req.url).searchParams.get('ping')
  if (ping !== '1' && ping !== 'img') return Response.json(info)
  if (!key) return Response.json({ ...info, ping: 'no_key' })

  // Tiny embedded 96x96 PNG to test the vision (image) path end-to-end.
  const TEST_IMG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAAjklEQVR42u3QMQ0AAAgDsMlGDnKQhQNOriZV0EwXhygQJEiQIEGCBAlCkCBBggQJEiQIQYIECRIkSJAgBAkSJEiQIEGCBCFIkCBBggQJEoQgQYIECRIkSBCCBAkSJEiQIEGCECRIkCBBggQJQpAgQYIECRIkCEGCBAkSJEiQIEEIEiRIkCBBggQhSJCgPwsKdoPu4hlJjAAAAABJRU5ErkJggg=='
  const userContent =
    ping === 'img'
      ? [
          { type: 'image_url', image_url: { url: TEST_IMG } },
          { type: 'text', text: 'reply with: ok' },
        ]
      : 'reply with: ok'

  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: userContent }] }),
    })
    const body = await r.text().catch(() => '')
    return Response.json({ ...info, ping: { mode: ping, status: r.status, ok: r.ok, body: body.slice(0, 400) } })
  } catch (e) {
    return Response.json({ ...info, ping: { error: String(e).slice(0, 200) } })
  }
}


// Recognized-dish shape returned to the front-end (unchanged contract).
const DishSchema = z.object({
  name: z.string(),
  price: z.coerce.number().catch(0),
  category: z.enum(['hot', 'cold', 'staple', 'soup', 'drink']).catch('staple'),
  description: z.string().catch(''),
})
const MenuSchema = z.object({ dishes: z.array(DishSchema) })

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif']
const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const SYSTEM_PROMPT = [
  'You read restaurant menus (Chinese or English) and extract every dish.',
  'Return ONLY a JSON object of the form {"dishes":[{"name":"","price":0,"category":"","description":""}]}.',
  '- name: the dish name in the menu\'s original language.',
  '- price: a number only, no currency symbol. If no price is shown, use 0.',
  '- category: exactly one of hot, cold, staple, soup, drink',
  '  (hot = signature / hot dishes; cold = cold dishes; staple = rice / noodles / buns / mains; soup; drink).',
  '- description: a short description if present on the menu, otherwise an empty string.',
  'Skip section headers that are not dishes. Output JSON only — no markdown, no commentary.',
].join('\n')

export async function POST(req: Request) {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'missing_api_key', message: '后台未配置 DASHSCOPE_API_KEY，请在 Vercel 环境变量中添加百炼 API Key。' },
      { status: 500 },
    )
  }
  const base = (process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/+$/, '')
  const model = process.env.QWEN_VL_MODEL || 'qwen-vl-max'

  let file: File | null = null
  try {
    const form = await req.formData()
    const f = form.get('file')
    if (f instanceof File) file = f
  } catch {
    return Response.json({ error: 'bad_request', message: '请用 multipart/form-data 上传文件字段 "file"。' }, { status: 400 })
  }
  if (!file) {
    return Response.json({ error: 'no_file', message: '没有收到文件。' }, { status: 400 })
  }

  const mime = file.type
  const isDocx = mime === DOCX_TYPE || /\.docx$/i.test(file.name)

  // Build the model input: image dishes are "seen"; Word docs are read as text.
  let userContent: unknown
  if (IMAGE_TYPES.includes(mime)) {
    const dataUrl = `data:${mime};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`
    userContent = [
      { type: 'image_url', image_url: { url: dataUrl } },
      { type: 'text', text: 'Extract every dish from this menu and return the JSON described above.' },
    ]
  } else if (isDocx) {
    let text = ''
    try {
      const mammoth = await import('mammoth')
      const buffer = Buffer.from(await file.arrayBuffer())
      text = (await mammoth.extractRawText({ buffer })).value.trim()
    } catch {
      return Response.json({ error: 'docx_failed', message: '无法读取该 Word 文件，请确认是 .docx 格式,或导出为 PDF / 图片。' }, { status: 400 })
    }
    if (!text) {
      return Response.json({ error: 'empty_docx', message: 'Word 里没读到文字(可能整张是图片),请把它导出成 PDF 或截图后再传。' }, { status: 400 })
    }
    userContent = `Here is the menu text:\n\n${text}\n\nExtract every dish and return the JSON described above.`
  } else {
    return Response.json(
      { error: 'unsupported_type', message: '支持图片(JPG/PNG/WEBP)、PDF、Word(.docx)。其它格式请先导出为图片或 PDF。' },
      { status: 400 },
    )
  }

  let res: Response
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    })
  } catch {
    return Response.json({ error: 'network', message: '连接识别服务失败，请稍后重试。' }, { status: 502 })
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    return Response.json(
      { error: 'extract_failed', message: `识别失败（${res.status}）：${detail.slice(0, 240)}`, detail: detail.slice(0, 300) },
      { status: 502 },
    )
  }

  const data = await res.json().catch(() => null)
  const raw = data?.choices?.[0]?.message?.content
  const text = Array.isArray(raw)
    ? raw.map((c: { text?: string }) => c?.text ?? '').join('')
    : typeof raw === 'string'
      ? raw
      : ''

  const parsed = MenuSchema.safeParse(extractJson(text))
  if (!parsed.success) {
    return Response.json({ dishes: [] })
  }
  return Response.json({ dishes: parsed.data.dishes })
}

/** Pull the JSON object out of the model's reply (tolerates code fences / prose). */
function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = fence ? fence[1] : text
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(body.slice(start, end + 1))
    } catch {
      // fall through
    }
  }
  try {
    return JSON.parse(body)
  } catch {
    return {}
  }
}
