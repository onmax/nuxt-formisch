export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  nitro: {
    output: { dir: '../.vercel/output' },
  },
  formisch: {},
})
