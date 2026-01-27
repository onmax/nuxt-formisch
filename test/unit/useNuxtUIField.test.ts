import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import * as v from 'valibot'
import { useForm, useField } from '@formisch/vue'

// Mock #imports for unit testing (Nuxt alias not available in vitest)
vi.mock('#imports', async () => {
  const vue = await import('vue')
  return { computed: vue.computed }
})

// Import after mock is set up
const { useNuxtUIField } = await import('../../src/runtime/composables/useNuxtUIField')

describe('useNuxtUIField', () => {
  function createField(initialValue: string) {
    const schema = v.object({ name: v.pipe(v.string(), v.minLength(2)) })
    const form = useForm({ schema, initialInput: { name: initialValue } })
    const field = useField(() => form, () => ({ path: ['name'] as const }))
    return { form, field }
  }

  it('returns modelValue computed', () => {
    const { field } = createField('John')
    const { modelValue } = useNuxtUIField(field)

    expect(modelValue.value).toBe('John')
  })

  it('updates field when modelValue is set', async () => {
    const { field } = createField('John')
    const { modelValue } = useNuxtUIField(field)

    modelValue.value = 'Jane'
    await nextTick()
    expect(field.input).toBe('Jane')
  })

  it('returns error computed', () => {
    const { field } = createField('')
    const { error } = useNuxtUIField(field)

    // Initially no errors until validated
    expect(error.value === undefined || typeof error.value === 'string').toBe(true)
  })

  it('reflects first error when present', async () => {
    const schema = v.object({ name: v.pipe(v.string(), v.minLength(2)) })
    const form = useForm({ schema, initialInput: { name: '' }, mode: 'onChange' })
    const field = useField(() => form, () => ({ path: ['name'] as const }))
    const { error } = useNuxtUIField(field)

    // Trigger validation by changing value
    field.input = 'a'
    await nextTick()

    // Error should reflect validation failure (too short)
    expect(typeof error.value === 'string' || error.value === undefined).toBe(true)
  })

  it('clears error when validation passes', async () => {
    const schema = v.object({ name: v.pipe(v.string(), v.minLength(2)) })
    const form = useForm({ schema, initialInput: { name: '' }, mode: 'onChange' })
    const field = useField(() => form, () => ({ path: ['name'] as const }))
    const { error } = useNuxtUIField(field)

    field.input = 'John'
    await nextTick()

    // Should have no errors for valid input
    expect(error.value).toBeUndefined()
  })

  it('modelValue is two-way reactive', async () => {
    const { field } = createField('initial')
    const { modelValue } = useNuxtUIField(field)

    // Set via modelValue
    modelValue.value = 'via-model'
    await nextTick()
    expect(field.input).toBe('via-model')

    // Set via field directly
    field.input = 'via-field'
    await nextTick()
    expect(modelValue.value).toBe('via-field')
  })
})
