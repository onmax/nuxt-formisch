import { defineNuxtModule, addComponent, addImports, addServerImports, createResolver, logger } from '@nuxt/kit'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleOptions {}

function isPackageInstalled(name: string): boolean {
  try {
    require.resolve(name)
    return true
  }
  catch {
    return false
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'formisch',
    configKey: 'formisch',
  },
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Check for schema library
    const hasValibot = isPackageInstalled('valibot')
    const hasZod = isPackageInstalled('zod')
    const hasArktype = isPackageInstalled('arktype')
    const hasNuxtUI = isPackageInstalled('@nuxt/ui')

    if (!hasValibot && !hasZod && !hasArktype) {
      logger.warn('Formisch requires a schema library. Install: valibot (recommended), zod, or arktype')
    }

    // Auto-import composables from @formisch/vue
    const composables = ['useForm', 'useField', 'useFieldArray']
    composables.forEach((name) => {
      addImports({ name, from: '@formisch/vue' })
    })

    // Auto-import module composables
    addImports({
      name: 'useFormFields',
      from: resolver.resolve('./runtime/composables/useFormFields'),
    })

    if (hasNuxtUI) {
      addImports({
        name: 'useNuxtUIField',
        from: resolver.resolve('./runtime/composables/useNuxtUIField'),
      })
    }

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

    // Auto-import components with F prefix
    const components = ['Form', 'Field', 'FieldArray']
    components.forEach((name) => {
      addComponent({ name: `F${name}`, export: name, filePath: '@formisch/vue' })
    })

    // Server-side composables
    addServerImports([{
      name: 'useFormValidation',
      from: resolver.resolve('./runtime/server/useFormValidation'),
    }])
  },
})
