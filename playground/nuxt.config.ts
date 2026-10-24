export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-10-01',
  nitro: {
    output: { dir: '../.vercel/output' },
  },
})
