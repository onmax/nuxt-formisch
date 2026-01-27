import { computed } from 'vue'
import type { FieldStore, Schema, RequiredPath } from '@formisch/vue'

export function useNuxtUIField<TSchema extends Schema, TPath extends RequiredPath>(field: FieldStore<TSchema, TPath>) {
  return {
    modelValue: computed({
      get: () => field.input,
      set: (v) => { field.input = v },
    }),
    error: computed(() => field.errors?.[0]),
  }
}
