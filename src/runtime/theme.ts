/**
 * Default `<FAutoForm>` theme, in the tailwind-variants shape Nuxt UI uses.
 * `appConfig.formisch.autoForm.slots` and the `ui` prop are merged on top. The
 * module also writes it to `.nuxt/ui/` so Tailwind generates its classes.
 */
export const autoFormTheme = {
  slots: {
    root: 'space-y-6',
    section: 'space-y-3',
    sectionTitle: 'text-base font-semibold text-highlighted',
    grid: 'grid gap-4',
    object: 'col-span-full space-y-3 rounded-lg border border-default p-4',
    objectLegend: 'px-1 text-sm font-medium text-highlighted',
    array: 'col-span-full space-y-2',
    arrayLegend: 'text-sm font-medium text-highlighted',
    arrayItem: 'flex items-start gap-2 rounded-md bg-elevated/50 p-2',
    arrayItemFields: 'grid flex-1 gap-3',
    arrayRemove: 'shrink-0',
    arrayAdd: '',
    input: 'w-full',
    json: 'w-full font-mono text-xs',
    unit: 'text-sm text-muted',
    error: 'text-sm text-error',
    actions: 'flex gap-2',
  },
  variants: {
    columns: {
      1: { grid: 'grid-cols-1', arrayItemFields: 'grid-cols-1' },
      2: { grid: 'sm:grid-cols-2', arrayItemFields: 'sm:grid-cols-2' },
      3: { grid: 'sm:grid-cols-2 lg:grid-cols-3', arrayItemFields: 'sm:grid-cols-2 lg:grid-cols-3' },
      4: { grid: 'sm:grid-cols-2 lg:grid-cols-4', arrayItemFields: 'sm:grid-cols-2 lg:grid-cols-4' },
    },
  },
  defaultVariants: {
    columns: 1,
  },
} as const

export type AutoFormSlot = keyof typeof autoFormTheme.slots

// SAFETY: `Object.keys` of the `as const` slots object returns exactly its keys.
export const autoFormSlots = Object.keys(autoFormTheme.slots) as AutoFormSlot[]

export type AutoFormColumns = keyof typeof autoFormTheme.variants.columns

/**
 * Theme overrides for `<FAutoForm>`, set in `app.config.ts`:
 *
 * ```ts
 * export default defineAppConfig({
 *   formisch: { autoForm: { slots: { arrayItem: 'bg-muted' } } },
 * })
 * ```
 */
export interface AutoFormThemeConfig {
  /** Classes merged into each slot with tailwind-merge. */
  slots?: Partial<Record<AutoFormSlot, string>>
}
