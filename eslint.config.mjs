// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Inspect the resolved config with `pnpm dlx @eslint/config-inspector`
export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: ['./playground'],
  },
}).prepend({
  ignores: ['docs', '.vercel', '**/.nuxt', '**/.output', 'dist'],
})
