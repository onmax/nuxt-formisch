// Draws the docs' Open Graph image (public/og/home.png, 1200x630) and the README banners
// (public/og/banner-{light,dark}.png, 1280x640 at 2x) in headless Chromium. Run `pnpm og` after
// changing this file. It needs Playwright's Chromium: `pnpm exec playwright-core install chromium`.
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const out = new URL('../public/og/', import.meta.url)

// Tailwind's emerald ramp, the docs' primary color (app/app.config.ts).
const emerald = { 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' }

type Theme = 'light' | 'dark'
const palette = {
  dark: {
    bg: '#09090b', text: '#fafafa', muted: '#a1a1aa', faint: '#52525b', line: '#ffffff0a',
    card: '#111113', cardBorder: '#27272a', bar: '#131316', barBorder: '#1f1f23', lineNo: '#3f3f46',
    input: '#18181b', inputBorder: '#3f3f46', accent: emerald[400], glow: 'rgb(16 185 129 / .18)',
    code: { k: '#f0abfc', s: '#a7f3d0', f: emerald[300], t: '#7dd3a8', a: '#a5b4fc', p: '#71717a', base: '#e4e4e7' },
    error: '#fb7185', shadow: '0 40px 80px -20px #000000e6',
  },
  light: {
    bg: '#ffffff', text: '#09090b', muted: '#52525b', faint: '#a1a1aa', line: '#0000000a',
    card: '#ffffff', cardBorder: '#e4e4e7', bar: '#fafafa', barBorder: '#e4e4e7', lineNo: '#d4d4d8',
    input: '#ffffff', inputBorder: '#d4d4d8', accent: emerald[600], glow: 'rgb(16 185 129 / .14)',
    code: { k: '#a21caf', s: '#047857', f: '#0f766e', t: '#15803d', a: '#4338ca', p: '#71717a', base: '#18181b' },
    error: '#e11d48', shadow: '0 30px 60px -20px #18181b40',
  },
} satisfies Record<Theme, unknown>

// The page is set as content, with no origin to load files from, so fonts go in as data URLs.
async function font(family: string, specifier: string) {
  const file = await readFile(fileURLToPath(import.meta.resolve(specifier)))
  return `@font-face{font-family:"${family}";src:url("data:font/woff2;base64,${file.toString('base64')}") format("woff2");font-weight:100 900}`
}
const fontFaces = await font('Inter', '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')
  + await font('JetBrains Mono', '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')

const nuxtMark = `<svg viewBox="0 0 48 32" aria-hidden="true"><path fill="#00DC82" d="M26.88 32H44.64C45.2068 32.0001 45.7492 31.8009 46.24 31.52C46.7308 31.2391 47.2367 30.8865 47.52 30.4C47.8033 29.9135 48.0002 29.3615 48 28.7998C47.9998 28.2381 47.8037 27.6864 47.52 27.2001L35.52 6.56C35.2368 6.0736 34.8907 5.72084 34.4 5.44C33.9093 5.15916 33.2066 4.96 32.64 4.96C32.0734 4.96 31.5307 5.15916 31.04 5.44C30.5493 5.72084 30.2032 6.0736 29.92 6.56L26.88 11.84L20.8 1.59962C20.5165 1.11326 20.1708 0.600786 19.68 0.32C19.1892 0.0392139 18.6467 0 18.08 0C17.5133 0 16.9708 0.0392139 16.48 0.32C15.9892 0.600786 15.4835 1.11326 15.2 1.59962L0.32 27.2001C0.0363166 27.6864 0.000246899 28.2381 3.05588e-07 28.7998C-0.000246288 29.3615 0.0367437 29.9134 0.32 30.3999C0.603256 30.8864 1.10919 31.2391 1.6 31.52C2.09081 31.8009 2.63324 32.0001 3.2 32H14.4C18.8379 32 22.068 30.0092 24.32 26.24L29.76 16.8L32.64 11.84L41.44 26.88H29.76L26.88 32ZM14.24 26.88H6.4L18.08 6.72L24 16.8L20.0786 23.636C18.5831 26.0816 16.878 26.88 14.24 26.88Z"/></svg>`
// The docs' favicon (public/favicon.svg): a form with two fields and a checked box.
const mark = (await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8')).replace('<svg ', '<svg aria-hidden="true" ')
const check = (color: string) => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// Each «class|text» is one highlighted token.
const code = [
  '«k|const» LoginSchema «p|=» v«p|.»«f|object»«p|({»',
  '  email«p|:» v«p|.»«f|pipe»«p|(»v«p|.»«f|string»«p|(),» v«p|.»«f|email»«p|()),»',
  '  password«p|:» v«p|.»«f|pipe»«p|(»v«p|.»«f|string»«p|(),» v«p|.»«f|minLength»«p|(»8«p|)),»',
  '«p|})»',
  '',
  '«k|const» form «p|=» «f|useForm»«p|({» schema«p|:» LoginSchema «p|})»',
  '',
  '«t|<FForm» «a|:of»«p|=»«s|"form"» «a|@submit»«p|=»«s|"login"»«t|>»',
  '  «t|<FField» «a|:path»«p|=»«s|"[\'email\']"» «a|v-slot»«p|=»«s|"field"»«t|>»',
]
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function highlight(line: string) {
  return line
    .split(/(«[a-z]\|[^»]*»)/)
    .map((part) => {
      const token = /^«([a-z])\|([^»]*)»$/.exec(part)
      return token ? `<span class="${token[1]}">${escape(token[2]!)}</span>` : escape(part)
    })
    .join('') || ' '
}

interface Layout {
  width: number
  height: number
  pad: number
  copy: number
  title: number
  sub: number
  window: { left: number, top: number, width: number, code: number }
  card: { left: number, top: number, width: number }
}

const layouts = {
  og: { width: 1200, height: 630, pad: 72, copy: 540, title: 64, sub: 23, window: { left: 640, top: 64, width: 520, code: 13.5 }, card: { left: 800, top: 312, width: 330 } },
  banner: { width: 1280, height: 640, pad: 80, copy: 540, title: 68, sub: 24, window: { left: 690, top: 72, width: 530, code: 13.5 }, card: { left: 860, top: 318, width: 340 } },
} satisfies Record<string, Layout>

function page(l: Layout, theme: Theme) {
  const c = palette[theme]
  const lines = code.map(line => `<div class="line"><span>${highlight(line)}</span></div>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces}
*{box-sizing:border-box}
html,body{margin:0;width:${l.width}px;height:${l.height}px;overflow:hidden}
body{position:relative;background:${c.bg};color:${c.text};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;background:radial-gradient(${l.width * 0.5}px ${l.height * 0.8}px at 85% 80%,${c.glow},transparent 70%),radial-gradient(${l.width * 0.4}px ${l.height * 0.7}px at 0% 0%,${c.glow},transparent 70%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(${c.line} 1px,transparent 1px),linear-gradient(90deg,${c.line} 1px,transparent 1px);background-size:40px 40px;background-position:-1px -1px;-webkit-mask-image:radial-gradient(ellipse 80% 90% at 60% 40%,#000 30%,transparent 85%)}

.copy{position:absolute;left:${l.pad}px;top:${l.pad}px;bottom:${l.pad}px;width:${l.copy}px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:12px;font:600 22px/1 "JetBrains Mono",monospace;letter-spacing:-.01em}
.brand svg{width:34px;height:34px}
h1{margin:auto 0 0;white-space:nowrap;font-size:${l.title}px;line-height:1.02;letter-spacing:-.045em;font-weight:700}
h1 em{font-style:normal;background:linear-gradient(180deg,${emerald[300]},${emerald[500]} 60%,${emerald[600]});-webkit-background-clip:text;background-clip:text;color:transparent}
p{margin:${l.sub}px 0 0;font-size:${l.sub}px;line-height:1.4;color:${c.muted};letter-spacing:-.012em;text-wrap:balance}
p b{color:${c.text};font-weight:500}
.foot{margin-top:auto;display:flex;align-items:center;gap:20px}
.install{font:500 19px/1 "JetBrains Mono",monospace;padding:16px 22px;border:1px solid ${c.cardBorder};border-radius:12px;background:${c.card};white-space:nowrap}
.install span{color:${c.accent};margin-right:6px}
.foot svg{height:24px;width:auto}

.window{position:absolute;left:${l.window.left}px;top:${l.window.top}px;width:${l.window.width}px;border:1px solid ${c.cardBorder};border-radius:16px;background:${c.card};overflow:hidden;box-shadow:${c.shadow}}
.bar{display:flex;align-items:center;gap:8px;height:42px;padding:0 18px;border-bottom:1px solid ${c.barBorder};background:${c.bar}}
.bar i{width:11px;height:11px;border-radius:50%;background:${c.cardBorder}}
.bar b{margin-left:12px;font:400 13px "JetBrains Mono",monospace;color:${c.muted}}
.bar b span{color:${c.faint}}
.code{counter-reset:n;padding:18px 0 22px;font:400 ${l.window.code}px/1.7 "JetBrains Mono",monospace;color:${c.code.base};white-space:pre}
.line{display:flex}
.line::before{content:counter(n);counter-increment:n;width:46px;padding-right:18px;text-align:right;color:${c.lineNo};flex:none}
.k{color:${c.code.k}}.s{color:${c.code.s}}.f{color:${c.code.f}}.t{color:${c.code.t}}.a{color:${c.code.a}}.p{color:${c.code.p}}

.card{position:absolute;left:${l.card.left}px;top:${l.card.top}px;width:${l.card.width}px;border:1px solid ${c.cardBorder};border-radius:14px;background:${c.card};padding:20px;display:flex;flex-direction:column;gap:14px;box-shadow:${c.shadow}}
label{display:block;font-size:14px;font-weight:500;margin-bottom:6px}
.input{display:flex;align-items:center;justify-content:space-between;height:38px;padding:0 12px;border:1px solid ${c.inputBorder};border-radius:8px;background:${c.input};font-size:14px;color:${c.text}}
.input svg{width:16px;height:16px}
.bad .input{border-color:${c.error};box-shadow:0 0 0 3px ${c.error}26}
.err{margin-top:6px;font-size:13px;color:${c.error}}
.button{height:40px;border-radius:8px;background:${emerald[500]};color:#fff;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center}
</style></head><body>
<div class="bg"></div><div class="grid"></div>
<div class="copy">
  <div class="brand">${mark}nuxt-formisch</div>
  <h1>Type-safe <em>forms</em><br>for Nuxt</h1>
  <p><b>Formisch</b> and <b>Valibot</b>, wired into Nuxt. One schema for the form, the server and a Nuxt UI AutoForm.</p>
  <div class="foot"><div class="install"><span>$</span>pnpm add nuxt-formisch valibot</div>${nuxtMark}</div>
</div>
<div class="window"><div class="bar"><i></i><i></i><i></i><b><span>app/pages/</span>login.vue</b></div><div class="code">${lines}</div></div>
<div class="card">
  <div class="bad"><label>Email</label><div class="input">ada@example</div><div class="err">Enter a valid email.</div></div>
  <div><label>Password</label><div class="input">••••••••••${check(c.accent)}</div></div>
  <div class="button">Log in</div>
</div>
</body></html>`
}

const shots = [
  { file: 'home.png', layout: layouts.og, theme: 'dark', scale: 1 },
  { file: 'banner-dark.png', layout: layouts.banner, theme: 'dark', scale: 2 },
  { file: 'banner-light.png', layout: layouts.banner, theme: 'light', scale: 2 },
] as const

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
try {
  for (const { file, layout, theme, scale } of shots) {
    const tab = await browser.newPage({ viewport: { width: layout.width, height: layout.height }, deviceScaleFactor: scale, colorScheme: theme })
    await tab.setContent(page(layout, theme), { waitUntil: 'load' })
    await tab.evaluate(() => document.fonts.ready)
    await tab.screenshot({ path: fileURLToPath(new URL(file, out)) })
    await tab.close()
    console.log(`docs/public/og/${file}`)
  }
}
finally {
  await browser.close()
}
