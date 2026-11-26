export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      script: [{ type: 'module', src: 'https://console.vitehub.dev/hosted-comments.js', 'data-vitehub-comments': 'b7bb7503-ab49-408a-adb6-73359b1c6df1', 'data-vitehub-repo': 'onmax/nuxt-formisch' }],
    },
  },
  compatibilityDate: '2026-10-01',
  nitro: {
    output: { dir: '../.vercel/output' },
  },
})
