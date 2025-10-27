export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  formisch: {},
  nitro: {
    output: { dir: '../.vercel/output' }
  }
})
