import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 60

// Recognized-dish shape returned to the front-end (unchanged contract).
const DishSchema = z.object({
  name: z.string(),
  price: z.coerce.number().catch(0),
  category: z.enum(['hot', 'cold', 'staple', 'soup', 'drink']).catch('staple'),
  description: z.string().catch(''),
})
const MenuSchema = z.object({ dishes: z.array(DishSchema) })

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif']

const SYSTEM_PROMPT = [
  'You read restaurant menus (Chinese or English) from a photo and extract every dish.',
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
  if (!IMAGE_TYPES.includes(mime)) {
    return Response.json(
      { error: 'unsupported_type', message: '通义千问 VL 仅支持图片(JPG / PNG / WEBP / BMP)。PDF、Excel、Word 请先截图或导出为图片。' },
      { status: 400 },
    )
  }
  const dataUrl = `data:${mime};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`

  let res: Response
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              { type: 'text', text: 'Extract every dish from this menu and return the JSON described above.' },
            ],
          },
        ],
      }),
    })
  } catch {
    return Response.json({ error: 'network', message: '连接识别服务失败，请稍后重试。' }, { status: 502 })
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    return Response.json(
      { error: 'extract_failed', message: `识别失败（${res.status}）。`, detail: detail.slice(0, 300) },
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
