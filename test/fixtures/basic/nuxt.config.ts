import { defineNuxtConfig } from 'nuxt/config'
import formisch from '../../../src/module'

// No @nuxt/ui here: proves the module works without it and AutoForm stays off.
export default defineNuxtConfig({
  modules: [formisch],
})
