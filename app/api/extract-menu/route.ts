import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 60

const DishSchema = z.object({
  name: z.string().describe('The dish name, in the menu\'s original language'),
  price: z.number().describe('The numeric price only, e.g. 28 (no currency symbol)'),
  category: z
    .enum(['hot', 'cold', 'staple', 'soup', 'drink'])
    .describe('hot=signature/hot dishes, cold=cold dishes, staple=rice/noodles/buns, soup, drink'),
  description: z.string().describe('A short description if present on the menu, otherwise an empty string'),
})

const MenuSchema = z.object({
  dishes: z.array(DishSchema),
})

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'missing_api_key', message: '后台未配置 ANTHROPIC_API_KEY，请在 Vercel 环境变量中添加。' },
      { status: 500 },
    )
  }

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
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')

  // Build the vision content block: images and PDFs are read natively by Claude.
  let mediaBlock: Anthropic.ContentBlockParam
  if ((IMAGE_TYPES as readonly string[]).includes(mime)) {
    mediaBlock = { type: 'image', source: { type: 'base64', media_type: mime as (typeof IMAGE_TYPES)[number], data: base64 } }
  } else if (mime === 'application/pdf') {
    mediaBlock = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
  } else {
    return Response.json(
      { error: 'unsupported_type', message: '目前支持图片(JPG/PNG/WEBP)和 PDF。Excel/Word 请先导出为 PDF 或截图。' },
      { status: 400 },
    )
  }

  const client = new Anthropic({ apiKey })
  try {
    const response = await client.messages.parse({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
      system:
        'You read restaurant menus from images or PDFs and extract every dish into structured data. ' +
        'Keep dish names in the menu\'s original language. Prices are numbers only. ' +
        'If a dish has no visible price, use 0. Skip section headers that are not dishes.',
      messages: [
        {
          role: 'user',
          content: [
            mediaBlock,
            { type: 'text', text: 'Extract all menu items from this menu.' },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(MenuSchema) },
    })

    if (response.stop_reason === 'refusal') {
      return Response.json({ error: 'refusal', message: '识别被拒绝，请换一张更清晰的菜单图片。' }, { status: 422 })
    }
    const parsed = response.parsed_output
    return Response.json({ dishes: parsed?.dishes ?? [] })
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? `识别失败（${err.status}）。` : '识别失败，请稍后重试。'
    return Response.json({ error: 'extract_failed', message }, { status: 502 })
  }
}
