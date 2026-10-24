import { inject } from 'vue'
import type { ComputedRef, InjectionKey, VNodeChild } from 'vue'
import type { FormStore } from '@formisch/vue'
import type { AutoFormSlot } from '../theme'
import type { ResolvedField } from './introspectSchema'

/** A field path as Formisch expects it, e.g. `['members', 0, 'name']`. */
export type FieldPath = readonly [string | number, ...(string | number)[]]

export interface AutoFormContext {
  form: FormStore
  disabled: ComputedRef<boolean>
  /** Final class string of every theme slot. */
  ui: ComputedRef<Record<AutoFormSlot, string>>
  /** Whether `<FAutoForm>` got a `field:<key>` slot for this key. */
  hasFieldSlot: (key: string) => boolean
  renderFieldSlot: (field: ResolvedField, path: FieldPath) => VNodeChild
}

export const autoFormKey: InjectionKey<AutoFormContext> = Symbol('nuxt-formisch:auto-form')

export function useAutoForm(): AutoFormContext {
  const context = inject(autoFormKey)
  if (!context) throw new Error('[nuxt-formisch] AutoForm fields must be rendered inside <FAutoForm>.')
  return context
}

/** Inline style for `FieldConfig.colSpan`. */
export function colSpan(span: number | undefined) {
  return span ? { gridColumn: `span ${span} / span ${span}` } : undefined
}

/**
 * Formisch types paths against the schema, which `<FAutoForm>` only knows at
 * runtime. The paths come from introspecting that same schema.
 */
export function formPath(path: FieldPath): never {
  // SAFETY: every path is built from `introspectSchema()` of the form's own schema, so it exists in the form store.
  return path as never
}
