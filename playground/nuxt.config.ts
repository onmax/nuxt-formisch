export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  nitro: {
    output: { dir: '../.vercel/output' },
  },
  formisch: {},
})
