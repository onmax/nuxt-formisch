export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui'],
  devtools: { enabled: true },
  app: {
    head: {
      script: [{ 'type': 'module', 'async': true, 'src': 'https://console.vitehub.dev/hosted-comments.js', 'data-vitehub-comments': 'b7bb7503-ab49-408a-adb6-73359b1c6df1', 'data-vitehub-repo': 'onmax/nuxt-formisch' }],
    },
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-10-01',
  nitro: {
    output: { dir: '../.vercel/output' },
  },
})
