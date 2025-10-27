import { addComponent, addImports, addServerImports, createResolver, defineNuxtModule, logger } from '@nuxt/kit'

export interface ModuleOptions extends Record<string, never> {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'formisch',
    configKey: 'formisch',
  },
  defaults: {},
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Check for schema library
    const hasValibot = nuxt.options._installedModules?.some(m => m.meta?.name === 'valibot')
    const hasZod = nuxt.options._installedModules?.some(m => m.meta?.name === 'zod')
    const hasArktype = nuxt.options._installedModules?.some(m => m.meta?.name === 'arktype')

    if (!hasValibot && !hasZod && !hasArktype) {
      logger.warn('Formisch requires a schema library. Install: valibot (recommended), zod, or arktype')
    }
    // Auto-import composables
    const composables = ['useForm', 'useField', 'useFieldArray']
    composables.forEach((name) => {
      addImports({ name, from: '@formisch/vue' })
    })

    // Auto-import methods
    const methods = ['focus', 'getAllErrors', 'getErrors', 'getInput', 'handleSubmit', 'insert', 'move', 'remove', 'replace', 'reset', 'setErrors', 'setInput', 'submit', 'swap', 'validate']
    methods.forEach((name) => {
      addImports({ name, from: '@formisch/vue' })
    })

    // Auto-import types
    const types = ['SubmitHandler', 'FormConfig', 'Schema', 'FieldElement', 'DeepPartial', 'PartialValues', 'PathValue', 'RequiredPath', 'ValidArrayPath', 'ValidationMode', 'ValidPath']
    types.forEach((name) => {
      addImports({ name, from: '@formisch/vue', type: true })
    })

    // Auto-import components
    const components = ['Form', 'Field', 'FieldArray']
    components.forEach((name) => {
      addComponent({ name: `Formisch${name}`, export: name, filePath: '@formisch/vue' })
    })

    // Server-side composables
    addServerImports([{
      name: 'useFormValidation',
      from: resolver.resolve('./runtime/server/useFormValidation'),
    }])
  },
})
