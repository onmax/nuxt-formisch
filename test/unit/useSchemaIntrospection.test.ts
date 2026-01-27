/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import * as v from 'valibot'
import { introspectSchema } from '../../src/runtime/composables/useSchemaIntrospection'

describe('introspectSchema', () => {
  describe('basic types', () => {
    it('resolves string field', () => {
      const schema = v.object({ name: v.string() })
      const fields = introspectSchema(schema)
      expect(fields).toHaveLength(1)
      expect(fields[0]).toMatchObject({ name: 'name', type: 'string', required: true, path: ['name'] })
    })

    it('resolves number field', () => {
      const schema = v.object({ age: v.number() })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'age', type: 'number', required: true })
    })

    it('resolves boolean field', () => {
      const schema = v.object({ active: v.boolean() })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'active', type: 'boolean', required: true })
    })

    it('resolves picklist field with options', () => {
      const schema = v.object({ role: v.picklist(['admin', 'user', 'guest']) })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'role', type: 'picklist', required: true })
      expect(fields[0].options).toEqual([
        { label: 'admin', value: 'admin' },
        { label: 'user', value: 'user' },
        { label: 'guest', value: 'guest' },
      ])
    })

    it('resolves enum field with options', () => {
      const schema = v.object({ status: v.enum({ active: 'active', inactive: 'inactive' }) })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'status', type: 'enum' })
      expect(fields[0].options).toBeDefined()
    })
  })

  describe('optional/nullable', () => {
    it('marks optional field as not required', () => {
      const schema = v.object({ bio: v.optional(v.string()) })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'bio', type: 'string', required: false })
    })

    it('marks nullable field as not required', () => {
      const schema = v.object({ bio: v.nullable(v.string()) })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'bio', type: 'string', required: false })
    })

    it('marks nullish field as not required', () => {
      const schema = v.object({ bio: v.nullish(v.string()) })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'bio', type: 'string', required: false })
    })
  })

  describe('constraints', () => {
    it('extracts min/max value constraints', () => {
      const schema = v.object({ age: v.pipe(v.number(), v.minValue(0), v.maxValue(120)) })
      const fields = introspectSchema(schema)
      expect(fields[0].constraints).toMatchObject({ min: 0, max: 120 })
    })

    it('extracts min/max length constraints', () => {
      const schema = v.object({ name: v.pipe(v.string(), v.minLength(2), v.maxLength(50)) })
      const fields = introspectSchema(schema)
      expect(fields[0].constraints).toMatchObject({ minLength: 2, maxLength: 50 })
    })

    it('extracts email constraint', () => {
      const schema = v.object({ email: v.pipe(v.string(), v.email()) })
      const fields = introspectSchema(schema)
      expect(fields[0].constraints).toMatchObject({ email: true })
    })

    it('extracts integer constraint', () => {
      const schema = v.object({ count: v.pipe(v.number(), v.integer()) })
      const fields = introspectSchema(schema)
      expect(fields[0].constraints).toMatchObject({ integer: true })
    })
  })

  describe('ui metadata', () => {
    it('extracts title as label', () => {
      const schema = v.object({ name: v.pipe(v.string(), v.title('Full Name')) })
      const fields = introspectSchema(schema)
      expect(fields[0].ui.label).toBe('Full Name')
    })

    it('extracts description', () => {
      const schema = v.object({ name: v.pipe(v.string(), v.description('Enter your name')) })
      const fields = introspectSchema(schema)
      expect(fields[0].ui.description).toBe('Enter your name')
    })

    it('extracts custom metadata (unit, section, placeholder)', () => {
      const schema = v.object({
        age: v.pipe(v.number(), v.metadata({ unit: 'years', section: 'Personal', placeholder: 'Enter age' })),
      })
      const fields = introspectSchema(schema)
      expect(fields[0].ui).toMatchObject({ unit: 'years', section: 'Personal', placeholder: 'Enter age' })
    })
  })

  describe('nested objects', () => {
    it('resolves nested object with children', () => {
      const schema = v.object({
        address: v.object({ street: v.string(), city: v.string() }),
      })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'address', type: 'object' })
      expect(fields[0].children).toHaveLength(2)
      expect(fields[0].children![0]).toMatchObject({ name: 'street', path: ['address', 'street'] })
      expect(fields[0].children![1]).toMatchObject({ name: 'city', path: ['address', 'city'] })
    })

    it('preserves full path for deeply nested fields', () => {
      const schema = v.object({
        person: v.object({ contact: v.object({ email: v.string() }) }),
      })
      const fields = introspectSchema(schema)
      const email = fields[0].children![0].children![0]
      expect(email.path).toEqual(['person', 'contact', 'email'])
    })
  })

  describe('arrays', () => {
    it('resolves array of objects with itemSchema', () => {
      const schema = v.object({
        members: v.array(v.object({ name: v.string(), role: v.string() })),
      })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'members', type: 'array' })
      expect(fields[0].itemSchema).toHaveLength(2)
      expect(fields[0].itemSchema![0]).toMatchObject({ name: 'name' })
    })

    it('resolves array of scalars with single itemSchema', () => {
      const schema = v.object({ tags: v.array(v.string()) })
      const fields = introspectSchema(schema)
      expect(fields[0]).toMatchObject({ name: 'tags', type: 'array' })
      expect(fields[0].itemSchema).toHaveLength(1)
      expect(fields[0].itemSchema![0]).toMatchObject({ name: 'value', type: 'string' })
    })
  })

  describe('fieldConfig overrides', () => {
    it('applies label override', () => {
      const schema = v.object({ name: v.string() })
      const fields = introspectSchema(schema, { name: { label: 'Custom Label' } })
      expect(fields[0].ui.label).toBe('Custom Label')
    })

    it('applies description override', () => {
      const schema = v.object({ name: v.string() })
      const fields = introspectSchema(schema, { name: { description: 'Custom desc' } })
      expect(fields[0].ui.description).toBe('Custom desc')
    })

    it('applies unit override', () => {
      const schema = v.object({ age: v.number() })
      const fields = introspectSchema(schema, { age: { unit: 'yrs' } })
      expect(fields[0].ui.unit).toBe('yrs')
    })

    it('applies placeholder override', () => {
      const schema = v.object({ name: v.string() })
      const fields = introspectSchema(schema, { name: { placeholder: 'Type here' } })
      expect(fields[0].ui.placeholder).toBe('Type here')
    })

    it('applies section override', () => {
      const schema = v.object({ name: v.string() })
      const fields = introspectSchema(schema, { name: { section: 'Details' } })
      expect(fields[0].ui.section).toBe('Details')
    })

    it('preserves original values when not overridden', () => {
      const schema = v.object({ name: v.pipe(v.string(), v.title('Original')) })
      const fields = introspectSchema(schema, { name: { description: 'Added' } })
      expect(fields[0].ui.label).toBe('Original')
      expect(fields[0].ui.description).toBe('Added')
    })
  })

  describe('error handling', () => {
    it('throws for non-object schema', () => {
      const schema = v.string()
      expect(() => introspectSchema(schema as any)).toThrow('expects a valibot object schema')
    })
  })
})
