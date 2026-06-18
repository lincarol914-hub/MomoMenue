import type { Config } from 'tailwindcss'

// Preflight is disabled so Tailwind's global reset can't disturb the existing
// inline-styled screens. The dashboard module uses utility classes for layout
// and inline styles for color; a small reset in globals.css covers buttons and
// headings that the module relies on.
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
} satisfies Config
