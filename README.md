# MomoMenu · 餐厅点餐系统

A bilingual (中文 / English) restaurant ordering system, implemented from a
Claude Design handoff. It shows two phone apps side by side:

- **Merchant back office** (商家后台) — welcome, login, dashboard (two home
  layouts), menu management with per-dish on/off toggles, add-dish flow
  (manual / file upload / photo capture), table QR codes, order center with
  accept → mark-ready actions, and settings.
- **Customer scan-to-order** (顾客扫码点餐) — category-tabbed menu, dish detail
  with quantity stepper, cart, and an order-placed screen with live status
  tracking.

Both apps share one store, so the language (中文 / EN) and home-layout
(A / B) toggles in the header drive both phones at once. Placing an order on
the customer side adds it to the merchant's order list in real time.

## Tech stack

- [Vite](https://vite.dev/) + [React 18](https://react.dev/) +
  TypeScript (strict)
- Inline styles, matching the design source pixel-for-pixel
- Procedurally drawn SVG icons and decorative QR codes — no icon/QR
  dependencies
- Fonts: Baloo 2 + Noto Sans SC (Google Fonts)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

## Project structure

```
index.html                  app shell + Google Fonts
public/assets/              illustrations and icon images from the design
src/
  main.tsx                 React entry
  App.tsx                  showcase page: header toggles + the two phones
  store.ts                 shared state + actions (ported from the prototype)
  data.ts                  menu, orders, and zh/en dictionaries
  styles.css               global reset + scrollbar hiding
  components/
    PhoneFrame.tsx         device shell (bezel, status bar, home indicator)
    Icon.tsx               line-art SVG icon set
    Qr.tsx                 deterministic decorative QR code
    MerchantPhone.tsx      all merchant screens + bottom nav
    CustomerPhone.tsx      all customer screens + cart bar
```

## Notes

- The dish data, prices, copy, and translations are carried over verbatim
  from the design. It is a front-end prototype: state is in-memory, login
  accepts any input (demo mode), and the QR codes are decorative rather than
  scannable. Wiring a real backend (auth, menu CRUD, live orders) is the
  natural next step.
