import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineNuxtModule, addComponent, addComponentsDir, addImports, addServerImports, createResolver, useLogger } from '@nuxt/kit'

const logger = useLogger('formisch')

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleOptions {}

function isPackageInstalled(name: string, rootDir: string): boolean {
  // Check node_modules directly as fallback for packages without a main export
  if (existsSync(join(rootDir, 'node_modules', ...name.split('/')))) return true
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
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    const rootDir = _nuxt.options.rootDir
    const hasValibot = isPackageInstalled('valibot', rootDir)
    const hasZod = isPackageInstalled('zod', rootDir)
    const hasArktype = isPackageInstalled('arktype', rootDir)
    const hasNuxtUI = isPackageInstalled('@nuxt/ui', rootDir)

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

    if (hasValibot) {
      addImports({
        name: 'jsonToValibotSchema',
        from: resolver.resolve('./runtime/composables/useJsonToSchema'),
      })
    }

    if (hasNuxtUI) {
      addImports({
        name: 'useNuxtUIField',
        from: resolver.resolve('./runtime/composables/useNuxtUIField'),
      })
      addImports({
        name: 'introspectSchema',
        from: resolver.resolve('./runtime/composables/useSchemaIntrospection'),
      })
      const autoFormTypes = ['ResolvedField', 'FieldConfig', 'FieldConstraints', 'FieldUI']
      autoFormTypes.forEach((name) => {
        addImports({ name, from: resolver.resolve('./runtime/composables/useSchemaIntrospection'), type: true })
      })
      addComponentsDir({ path: resolver.resolve('./runtime/components'), prefix: 'F' })
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
