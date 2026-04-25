import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const outputPath = resolve(projectRoot, 'public/og-image.png')

const WIDTH = 1200
const HEIGHT = 630

// Hex equivalents of the dark theme tokens defined in src/styles/global.css
// (kept in sync manually because librsvg cannot resolve CSS custom properties).
const COLORS = {
  background: '#252525',       // oklch(0.145 0 0)
  foreground: '#fafafa',       // oklch(0.985 0 0)
  mutedForeground: '#b5b5b5',  // oklch(0.708 0 0)
  border: 'rgba(255,255,255,0.10)',
  dot: 'rgba(255,255,255,0.06)',
}

const BRAND = 'DANHTHANH.DEV'
const NAME = 'Danh Thanh'
const TAGLINE_LINE_1 = 'Building onboarding, internal tooling,'
const TAGLINE_LINE_2 = 'and operational systems with clear proof.'
const ROLE = 'SOFTWARE ENGINEER  /  WRITER'

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="${COLORS.dot}"/>
    </pattern>
  </defs>

  <!-- Surface -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.background}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#dot-grid)"/>

  <!-- Top hairline border -->
  <line x1="0" y1="0.5" x2="${WIDTH}" y2="0.5" stroke="${COLORS.border}" stroke-width="1"/>

  <!-- Brand mark (top-left, monospace, tracked) -->
  <text
    x="80" y="120"
    font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    font-size="22"
    font-weight="500"
    letter-spacing="6"
    fill="${COLORS.mutedForeground}"
  >${BRAND}</text>

  <!-- Hairline accent under brand -->
  <line x1="80" y1="148" x2="180" y2="148" stroke="${COLORS.foreground}" stroke-width="2"/>

  <!-- Big name -->
  <text
    x="80" y="320"
    font-family="'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    font-size="96"
    font-weight="600"
    letter-spacing="-2"
    fill="${COLORS.foreground}"
  >${NAME}</text>

  <!-- Tagline -->
  <text
    x="80" y="400"
    font-family="'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    font-size="34"
    font-weight="400"
    fill="${COLORS.mutedForeground}"
  >${TAGLINE_LINE_1}</text>
  <text
    x="80" y="448"
    font-family="'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    font-size="34"
    font-weight="400"
    fill="${COLORS.mutedForeground}"
  >${TAGLINE_LINE_2}</text>

  <!-- Footer hairline + role -->
  <line x1="80" y1="540" x2="${WIDTH - 80}" y2="540" stroke="${COLORS.border}" stroke-width="1"/>
  <text
    x="80" y="580"
    font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    font-size="18"
    font-weight="500"
    letter-spacing="4"
    fill="${COLORS.mutedForeground}"
  >${ROLE}</text>

  <!-- Right-edge corner mark -->
  <text
    x="${WIDTH - 80}" y="580"
    text-anchor="end"
    font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    font-size="18"
    font-weight="500"
    letter-spacing="4"
    fill="${COLORS.mutedForeground}"
  >DT</text>
</svg>
`

async function generate() {
  const outDir = dirname(outputPath)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer()

  writeFileSync(outputPath, pngBuffer)
  const kb = (pngBuffer.byteLength / 1024).toFixed(1)
  console.log(`✓ generated public/og-image.png (${WIDTH}x${HEIGHT}, ${kb} KB)`)
}

generate().catch((err) => {
  console.error('✗ failed to generate og-image.png:', err)
  process.exit(1)
})
