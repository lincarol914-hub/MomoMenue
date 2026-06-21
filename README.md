# MomoMenu · 餐厅点餐系统

A bilingual (中文 / English) restaurant ordering system, implemented from a
Claude Design handoff. It is one full-screen app with two entry points:

- **Merchant back office** (`/`) — welcome, login, dashboard, menu management
  with per-dish on/off toggles, add-dish flow (manual / file upload / photo
  capture), table QR codes, order center with accept → mark-ready actions, and
  settings. An in-app 中文 / EN toggle sits in the top-right.
- **Customer scan-to-order** (`/?table=01`) — opened by scanning a table's QR
  code: a category-tabbed menu, dish detail with quantity stepper, cart, and an
  order-placed screen with live status tracking, pre-set to that table.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + [React 18](https://react.dev/) +
  TypeScript (strict)
- Inline styles, matching the design source pixel-for-pixel
- Real, scannable QR codes via [`qrcode`](https://www.npmjs.com/package/qrcode);
  line-art SVG icon set drawn in code
- Fonts: Plus Jakarta Sans + Noto Sans SC (Google Fonts)

Next.js is used so the app can grow a backend (API routes under `app/api/…`)
when real-time orders / persistence are added; today it is still front-end only.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
```

## Project structure

```
app/
  layout.tsx               root layout: <html>/<body> + Google Fonts
  page.tsx                 routes on ?table= → merchant or customer
  globals.css              global reset + scrollbar hiding
public/assets/             illustrations and icon images from the design
src/
  MerchantApp.tsx          'use client' wrapper for the back office
  CustomerApp.tsx          'use client' wrapper for the ordering page
  store.ts                 state + actions (ported from the prototype)
  data.ts                  menu, orders, tables, and zh/en dictionaries
  qr-export.ts             table link builder + QR PNG download helpers
  components/
    PhoneFrame.tsx         app shell (full-screen + framed mockup modes)
    Icon.tsx               line-art SVG icon set
    QrCode.tsx             real scannable QR canvas
    MerchantPhone.tsx      all merchant screens + bottom nav
    CustomerPhone.tsx      all customer screens + cart bar
```

## Table QR ordering

Each table has its own QR code. The code encodes a URL like
`https://<your-domain>/?table=01`. The app routes on that `table` query
param:

- **no `table`** → merchant back office
- **`?table=01`** → customer ordering page, pre-set to table `01`; placing an
  order tags it with that table number.

In the merchant **Tables** screen you can add tables, download a single
table's QR card (PNG), or one-click **download all** as a single printable
sheet (`下载全部二维码`). QR codes are generated client-side with the
`qrcode` library and point at the current deployment's origin, so they work
as soon as the site is live — print them and place one on each table.

## Back-office dashboard

The merchant home is the dashboard module under `src/dashboard/` (Tailwind for
layout, inline styles for color). The Home screen replaces the old dashboard;
its quick actions open three more screens — **营业概览 (Overview)**, **数据统计
(Stats)**, and **菜单设计 (Menu Design)** — each with a back button. The menu
design (theme color, background pattern, and list/card/grid layout) drives the
live customer ordering page.

## Cross-device menu sync

The merchant back office publishes a single **menu snapshot** (theme + dishes +
which dishes are turned off) to a shared cloud store, and every scanned phone
reads the same copy — so design and menu changes sync across devices:

- `POST/GET /api/menu-state` stores the snapshot in **Vercel KV / Upstash
  Redis** (via its REST API). The merchant auto-publishes on any design/menu
  change (debounced); `src/menu-sync.ts` holds the client helpers.
- The customer page loads the snapshot on open, then refreshes every 10s and
  whenever the tab becomes visible again, so the menu updates within seconds of
  the merchant saving.
- **Setup:** in Vercel, Storage → add **Upstash for Redis**, connect it to the
  project, and redeploy. Vercel injects `KV_REST_API_URL` / `KV_REST_API_TOKEN`
  (or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) — both are
  accepted. Without them the app still runs locally per-device, but changes
  won't reach other phones. The bottom tab bar stays 首页 / 订单 / 菜单 / 设置, so
menu management (incl. AI recognition), orders, and settings are unchanged.

Tailwind is configured with **preflight disabled** so it can't disturb the
rest of the app's inline-styled screens; a small reset in `app/globals.css`
covers the buttons/headings the module needs.

## Menu recognition (AI)

The merchant **Add dish** screen can build the menu from a photo:

- **上传文件 / 拍照添加** send the image to `POST /api/extract-menu`, a Next.js
  route that calls **Alibaba Bailian (DashScope) Qwen-VL** (OpenAI-compatible
  endpoint) and returns the dishes (name, price, category, description) as
  structured JSON. Recognized dishes are listed for the owner to review, then
  added to the menu in one tap. Chinese and English menus are both supported.
- Supported inputs: images (JPG / PNG / WEBP / BMP). PDF / Excel / Word should
  be screenshotted or exported to an image first (Qwen-VL is image-only).

**Setup:** create an API key in the Bailian console (百炼 → API-KEY), then set
these env vars (Vercel: Project → Settings → Environment Variables; local: copy
`.env.example` to `.env.local`):

- `DASHSCOPE_API_KEY` (required) — your Bailian API key (`sk-...`)
- `DASHSCOPE_BASE_URL` (optional) — OpenAI-compatible base URL; defaults to
  `https://dashscope.aliyuncs.com/compatible-mode/v1`
- `QWEN_VL_MODEL` (optional) — defaults to `qwen-vl-max`

Without the key the endpoint returns a clear "key not configured" message and
the rest of the app still works.

## Notes

- The dish data, prices, copy, and translations are carried over verbatim
  from the design. It is still front-end only: state is in-memory and login
  accepts any input (demo mode), so a customer's order is not yet pushed to a
  separate merchant device. The QR codes are real and scannable. Next steps:
  add Next.js API routes + a database (e.g. Supabase) for auth, menu CRUD, and
  live orders.
