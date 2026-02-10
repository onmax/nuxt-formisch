import { describe, it, expect, vi } from 'vitest'
import * as v from 'valibot'
import { useForm } from '@formisch/vue'

// Mock #imports for unit testing (Nuxt alias not available in vitest)
vi.mock('#imports', async () => {
  const formisch = await import('@formisch/vue')
  return { useField: formisch.useField }
})

// Import after mock is set up
const { useFormFields } = await import('../../src/runtime/composables/useFormFields')

describe('useFormFields', () => {
  it('returns field accessor', () => {
    const schema = v.object({ name: v.string(), age: v.number() })
    const form = useForm({ schema, initialInput: { name: 'John', age: 30 } })
    const { field } = useFormFields(form)

    expect(typeof field).toBe('function')
  })

  it('accesses field input value', () => {
    const schema = v.object({ name: v.string() })
    const form = useForm({ schema, initialInput: { name: 'John' } })
    const { field } = useFormFields(form)

    const nameField = field('name')
    expect(nameField.input).toBe('John')
  })

  it('returns field path', () => {
    const schema = v.object({ email: v.string() })
    const form = useForm({ schema, initialInput: { email: 'test@test.com' } })
    const { field } = useFormFields(form)

    const emailField = field('email')
    expect(emailField.path).toEqual(['email'])
  })

  it('allows updating field input', () => {
    const schema = v.object({ name: v.string() })
    const form = useForm({ schema, initialInput: { name: 'John' } })
    const { field } = useFormFields(form)

    const nameField = field('name')
    nameField.input = 'Jane'
    expect(nameField.input).toBe('Jane')
  })

  it('exposes field validation state', () => {
    const schema = v.object({ name: v.pipe(v.string(), v.minLength(2)) })
    const form = useForm({ schema, initialInput: { name: '' } })
    const { field } = useFormFields(form)

    const nameField = field('name')
    expect(typeof nameField.isValid).toBe('boolean')
    expect(typeof nameField.isTouched).toBe('boolean')
    expect(typeof nameField.isDirty).toBe('boolean')
  })

  it('exposes field errors', () => {
    const schema = v.object({ name: v.string() })
    const form = useForm({ schema, initialInput: { name: '' } })
    const { field } = useFormFields(form)

    const nameField = field('name')
    expect(nameField.errors === null || Array.isArray(nameField.errors)).toBe(true)
  })

  it('exposes field props for binding', () => {
    const schema = v.object({ name: v.string() })
    const form = useForm({ schema, initialInput: { name: '' } })
    const { field } = useFormFields(form)

    const nameField = field('name')
    expect(nameField.props).toBeDefined()
    // props.name is serialized path, can be string or JSON array
    expect(nameField.props.name).toBeDefined()
    expect(typeof nameField.props.ref).toBe('function')
    expect(typeof nameField.props.onBlur).toBe('function')
  })
})
