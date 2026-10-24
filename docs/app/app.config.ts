export default defineAppConfig({
  docus: {
    locale: 'en',
  },
  assistant: { enabled: false, explainWithAi: false },
  header: {
    title: 'Nuxt Formisch',
    logo: { favicon: '/favicon.svg' },
  },
  github: {
    url: 'https://github.com/onmax/nuxt-formisch',
    branch: 'main',
    rootDir: 'docs',
  },
  socials: {
    npm: 'https://npmx.dev/package/nuxt-formisch',
  },
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc',
    },
  },
})
