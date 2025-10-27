export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  nitro: {
    output: { dir: '../.vercel/output' },
  },
  formisch: {},
})
