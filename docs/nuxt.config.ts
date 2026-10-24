const url = 'https://nuxt-formisch.onmax.me'
const ogImage = `${url}/og/home.png`
const ogImageAlt = 'Nuxt Formisch: type-safe forms for Nuxt with Formisch and Valibot'

export default defineNuxtConfig({
  extends: ['docus'],

  // Every page shares the static image drawn by `pnpm og`.
  ogImage: { enabled: false },

  // Docus turns its paid AI assistant on when a Vercel build has VERCEL_OIDC_TOKEN.
  docus: {
    assistant: { enabled: false },
  },

  site: {
    url,
    name: 'Nuxt Formisch',
    description: 'Type-safe, headless forms for Nuxt with Formisch and Valibot, plus an optional Nuxt UI AutoForm.',
    defaultLocale: 'en',
  },

  app: {
    head: {
      meta: [
        { property: 'og:image', content: ogImage },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: ogImageAlt },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: ogImage },
      ],
    },
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: { default: 'github-light', light: 'github-light', dark: 'github-dark' },
        },
      },
    },
  },

  compatibilityDate: '2026-10-01',

  // Pages from the old undocs site
  routeRules: {
    '/guide': { redirect: '/getting-started' },
    '/guide/auto-form': { redirect: '/auto-form' },
    '/guide/customization': { redirect: '/auto-form/customization' },
    '/guide/nuxt-ui': { redirect: '/forms/components#with-nuxt-ui' },
    '/composables': { redirect: '/forms/composables' },
    '/composables/**': { redirect: '/forms/composables' },
    '/components': { redirect: '/forms/components' },
    '/components/**': { redirect: '/forms/components' },
    '/server': { redirect: '/forms/server-validation' },
    '/auto-form/f-auto-form': { redirect: '/auto-form' },
    '/auto-form/schema-introspection': { redirect: '/auto-form/customization' },
  },

  llms: {
    domain: url,
    title: 'Nuxt Formisch',
    description: 'Formisch and Valibot forms for Nuxt.',
  },
})
