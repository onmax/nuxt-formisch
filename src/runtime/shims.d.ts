// Shim for #imports when type-checking outside Nuxt context
declare module '#imports' {
  export const computed: typeof import('vue')['computed']
  export const ref: typeof import('vue')['ref']
  export const watch: typeof import('vue')['watch']
  export const toRaw: typeof import('vue')['toRaw']
  export const resolveComponent: typeof import('vue')['resolveComponent']
  export const h: typeof import('vue')['h']
  export const useId: typeof import('vue')['useId']

  // Nuxt composables - basic stubs
  export function useAppConfig(): { ui?: Record<string, unknown> }
  export function useForm(opts: unknown): { isDirty: boolean }
  export function useField(form: unknown, opts: unknown): { input: unknown, errors: string[] }
}
