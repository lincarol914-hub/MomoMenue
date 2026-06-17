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

## Notes

- The dish data, prices, copy, and translations are carried over verbatim
  from the design. It is still front-end only: state is in-memory and login
  accepts any input (demo mode), so a customer's order is not yet pushed to a
  separate merchant device. The QR codes are real and scannable. Next steps:
  add Next.js API routes + a database (e.g. Supabase) for auth, menu CRUD, and
  live orders.
