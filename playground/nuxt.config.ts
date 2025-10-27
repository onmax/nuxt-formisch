export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/tailwindcss', '@nuxt/eslint'],
  devtools: { enabled: true },
  nitro: {
    output: { dir: '../.vercel/output' },
  },
  formisch: {},
  eslint: {
    config: {
      standalone: false,
    },
  },
})
