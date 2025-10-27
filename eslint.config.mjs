// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './playground/.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    stylistic: true,
    ignores: [
      '.nuxt',
      '.output',
      'dist',
      'node_modules',
      'playground/.nuxt',
      'playground/.output',
      'playground/dist',
    ],
  }),
)
