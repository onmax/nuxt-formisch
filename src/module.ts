import { addComponent, addImports, addServerImports, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, hasNuxtModule, resolveModule } from '@nuxt/kit'
import { formisch } from './formisch'
import { autoFormTheme } from './runtime/theme'

export interface ModuleOptions {
  /**
   * Auto-import Formisch composables (`useForm`, `useField`, `useFieldArray`),
   * methods (`validate`, `reset`, `setInput`, ...) and types (`FormStore`, ...).
   * @default true
   */
  imports: boolean
  /**
   * Register Formisch's `Form`, `Field` and `FieldArray` components with `prefix`.
   * @default true
   */
  components: boolean
  /**
   * Prefix for every component the module registers: `FForm`, `FField`, `FAutoForm`, ...
   * @default 'F'
   */
  prefix: string
  /**
   * Register `<FAutoForm>` and auto-import `introspectSchema()`. Needs `@nuxt/ui`.
   * @default true when `@nuxt/ui` is in `modules`
   */
  autoForm: boolean
}

export type { AutoFormThemeConfig } from './runtime/theme'
export type { FieldConfig, FieldConstraints, FieldOption, FieldType, ResolvedField } from './runtime/utils/introspectSchema'
export type { JsonToValibotSchemaOptions } from './runtime/utils/jsonToValibotSchema'
export type { FormIssue, FormValidationErrorData } from './runtime/server/utils/readValidatedFormBody'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-formisch',
    configKey: 'formisch',
    compatibility: { nuxt: '>=4.0.0' },
  },
  defaults: nuxt => ({
    imports: true,
    components: true,
    prefix: 'F',
    autoForm: hasNuxtModule('@nuxt/ui', nuxt),
  }),
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    // Resolved from this module, so apps under strict pnpm don't need their own `@formisch/vue`.
    const formischVue = resolveModule('@formisch/vue', { url: new URL(import.meta.url) })

    if (options.imports) {
      addImports([...formisch.composables, ...formisch.methods].map(name => ({ name, from: formischVue })))
      addImports(formisch.types.map(name => ({ name, from: formischVue, type: true, priority: -1 })))
    }
    addImports({ name: 'jsonToValibotSchema', from: resolve('./runtime/utils/jsonToValibotSchema') })

    if (options.components) {
      for (const name of formisch.components) {
        addComponent({ name: `${options.prefix}${name}`, export: name, filePath: formischVue })
      }
    }

    addServerImports([{ name: 'readValidatedFormBody', from: resolve('./runtime/server/utils/readValidatedFormBody') }])
    addTypeTemplate({
      filename: 'types/nuxt-formisch.d.ts',
      getContents: () => `import type { AutoFormThemeConfig } from ${JSON.stringify(resolve('./runtime/theme'))}

interface FormischAppConfig {
  /** Theme overrides for \`<FAutoForm>\`. */
  autoForm?: AutoFormThemeConfig
}

declare module 'nuxt/schema' {
  interface AppConfigInput { formisch?: FormischAppConfig }
  interface CustomAppConfig { formisch?: FormischAppConfig }
}

export {}
`,
    })

    if (!options.autoForm) return
    if (!hasNuxtModule('@nuxt/ui', nuxt)) {
      throw new Error('[nuxt-formisch] `autoForm` needs Nuxt UI. Install `@nuxt/ui` and add it to `modules`, or set `formisch: { autoForm: false }`.')
    }

    const introspection = resolve('./runtime/utils/introspectSchema')
    addImports({ name: 'introspectSchema', from: introspection })
    addImports(['FieldConfig', 'ResolvedField'].map(name => ({ name, from: introspection, type: true, priority: -1 })))
    addComponent({ name: `${options.prefix}AutoForm`, filePath: resolve('./runtime/components/AutoForm.vue') })

    // Only here so Tailwind sees the theme classes: Nuxt UI adds `.nuxt/ui/` to Tailwind's sources.
    addTemplate({
      filename: 'ui/formisch-auto-form.ts',
      write: true,
      getContents: () => `export default ${JSON.stringify(autoFormTheme, null, 2)} as const\n`,
    })
  },
})
