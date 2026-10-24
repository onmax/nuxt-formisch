import { computed } from '#imports'
import type { FieldStore, FormSchema, RequiredPath } from '@formisch/vue'

export function useNuxtUIField<TSchema extends FormSchema, TPath extends RequiredPath>(field: FieldStore<TSchema, TPath>) {
  return {
    modelValue: computed({
      get: () => field.input,
      set: (v) => { field.input = v },
    }),
    error: computed(() => field.errors?.[0]),
  }
}
