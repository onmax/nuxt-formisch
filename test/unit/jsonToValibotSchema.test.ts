/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { jsonToValibotSchema } from '../../src/runtime/composables/useJsonToSchema'

function getTitle(schema: any): string | undefined {
  if (schema.pipe) {
    const titleAction = schema.pipe.find((a: any) => a.type === 'title')
    return titleAction?.title
  }
  return undefined
}

describe('jsonToValibotSchema', () => {
  describe('primitive types', () => {
    it('infers string schema', () => {
      const schema = jsonToValibotSchema('hello')
      expect(schema.type).toBe('string')
    })

    it('infers number schema', () => {
      const schema = jsonToValibotSchema(42)
      expect(schema.type).toBe('number')
    })

    it('infers boolean schema', () => {
      const schema = jsonToValibotSchema(true)
      expect(schema.type).toBe('boolean')
    })

    it('infers nullable schema for null', () => {
      const schema = jsonToValibotSchema(null)
      expect(schema.type).toBe('nullable')
    })

    it('infers nullable schema for undefined', () => {
      const schema = jsonToValibotSchema(undefined)
      expect(schema.type).toBe('nullable')
    })
  })

  describe('string pattern detection', () => {
    it('detects email pattern', () => {
      const schema = jsonToValibotSchema({ email: 'foo@bar.com' })
      const emailSchema = (schema as any).entries.email
      expect(emailSchema.pipe.some((a: any) => a.type === 'email')).toBe(true)
    })

    it('detects URL pattern', () => {
      const schema = jsonToValibotSchema({ website: 'https://example.com' })
      const urlSchema = (schema as any).entries.website
      expect(urlSchema.pipe.some((a: any) => a.type === 'url')).toBe(true)
    })

    it('detects ISO date pattern', () => {
      const schema = jsonToValibotSchema({ date: '2024-01-15' })
      const dateSchema = (schema as any).entries.date
      expect(dateSchema.pipe.some((a: any) => a.type === 'iso_date')).toBe(true)
    })

    it('detects ISO datetime pattern', () => {
      const schema = jsonToValibotSchema({ datetime: '2024-01-15T10:30:00Z' })
      const datetimeSchema = (schema as any).entries.datetime
      expect(datetimeSchema.pipe.some((a: any) => a.type === 'iso_date')).toBe(true)
    })

    it('keeps UUID as plain string (no uuid validation)', () => {
      const schema = jsonToValibotSchema({ id: '550e8400-e29b-41d4-a716-446655440000' })
      const idSchema = (schema as any).entries.id
      expect(idSchema.pipe.some((a: any) => a.type === 'uuid')).toBe(false)
    })
  })

  describe('arrays', () => {
    it('infers array of strings', () => {
      const schema = jsonToValibotSchema(['a', 'b'])
      expect(schema.type).toBe('array')
      expect((schema as any).item.type).toBe('string')
    })

    it('infers array of numbers', () => {
      const schema = jsonToValibotSchema([1, 2, 3])
      expect(schema.type).toBe('array')
      expect((schema as any).item.type).toBe('number')
    })

    it('infers empty array as array of strings (fallback)', () => {
      const schema = jsonToValibotSchema([])
      expect(schema.type).toBe('array')
      expect((schema as any).item.type).toBe('string')
    })

    it('infers array of objects', () => {
      const schema = jsonToValibotSchema([{ name: 'test' }])
      expect(schema.type).toBe('array')
      expect((schema as any).item.type).toBe('object')
    })

    it('infers mixed array as array of any', () => {
      const schema = jsonToValibotSchema([1, 'a', true])
      expect(schema.type).toBe('array')
      expect((schema as any).item.type).toBe('any')
    })

    it('ignores null values when determining array type', () => {
      const schema = jsonToValibotSchema([null, 'a', 'b'])
      expect(schema.type).toBe('array')
      expect((schema as any).item.type).toBe('string')
    })

    it('infers all-null array as array of strings', () => {
      const schema = jsonToValibotSchema([null, null])
      expect(schema.type).toBe('array')
      expect((schema as any).item.type).toBe('string')
    })
  })

  describe('humanized labels', () => {
    it('humanizes snake_case keys', () => {
      const schema = jsonToValibotSchema({ user_name: 'John' })
      const userNameSchema = (schema as any).entries.user_name
      expect(getTitle(userNameSchema)).toBe('User Name')
    })

    it('humanizes camelCase keys', () => {
      const schema = jsonToValibotSchema({ firstName: 'Jane' })
      const firstNameSchema = (schema as any).entries.firstName
      expect(getTitle(firstNameSchema)).toBe('First Name')
    })

    it('humanizes kebab-case keys', () => {
      const schema = jsonToValibotSchema({ 'config-value': 'test' })
      const configSchema = (schema as any).entries['config-value']
      expect(getTitle(configSchema)).toBe('Config Value')
    })

    it('handles acronyms in keys', () => {
      const schema = jsonToValibotSchema({ XMLParser: 'test' })
      const parserSchema = (schema as any).entries.XMLParser
      expect(getTitle(parserSchema)).toBe('XML Parser')
    })

    it('adds labels to nested object fields', () => {
      const schema = jsonToValibotSchema({ user: { email_address: 'foo@bar.com' } })
      const emailSchema = (schema as any).entries.user.entries.email_address
      expect(getTitle(emailSchema)).toBe('Email Address')
    })

    it('adds labels to array fields in objects', () => {
      const schema = jsonToValibotSchema({ tag_list: ['a', 'b'] })
      const tagListSchema = (schema as any).entries.tag_list
      expect(getTitle(tagListSchema)).toBe('Tag List')
    })
  })

  describe('objects', () => {
    it('infers flat object schema', () => {
      const schema = jsonToValibotSchema({ name: 'John', age: 30 })
      expect(schema.type).toBe('object')
      expect(getTitle((schema as any).entries.name)).toBe('Name')
      expect(getTitle((schema as any).entries.age)).toBe('Age')
    })

    it('infers nested object schema', () => {
      const schema = jsonToValibotSchema({ user: { profile: { name: 'John' } } })
      expect(schema.type).toBe('object')
      expect((schema as any).entries.user.type).toBe('object')
      expect((schema as any).entries.user.entries.profile.type).toBe('object')
    })

    it('infers object with mixed types', () => {
      const schema = jsonToValibotSchema({ name: 'test', count: 5, active: true, tags: ['a'] })
      expect(getTitle((schema as any).entries.name)).toBe('Name')
      expect(getTitle((schema as any).entries.count)).toBe('Count')
      expect(getTitle((schema as any).entries.active)).toBe('Active')
      expect(getTitle((schema as any).entries.tags)).toBe('Tags')
    })
  })

  describe('depth limit', () => {
    it('respects maxDepth option', () => {
      const deepObj = { a: { b: { c: { d: { e: 'deep' } } } } }
      const schema = jsonToValibotSchema(deepObj, { maxDepth: 2 })
      const cSchema = (schema as any).entries.a.entries.b.entries.c
      expect(cSchema.type).toBe('any')
    })

    it('allows deep nesting by default (up to 10)', () => {
      const deepObj = { a: { b: { c: { d: { e: 'deep' } } } } }
      const schema = jsonToValibotSchema(deepObj)
      const eSchema = (schema as any).entries.a.entries.b.entries.c.entries.d.entries.e
      expect(getTitle(eSchema)).toBe('E')
    })
  })

  describe('validation', () => {
    it('validates matching data', async () => {
      const schema = jsonToValibotSchema({ name: 'test', age: 30 })
      const result = await (schema as any)['~standard'].validate({ name: 'John', age: 25 })
      expect(result.issues).toBeUndefined()
      expect(result.value).toEqual({ name: 'John', age: 25 })
    })

    it('rejects mismatched types', async () => {
      const schema = jsonToValibotSchema({ age: 30 })
      const result = await (schema as any)['~standard'].validate({ age: 'not a number' })
      expect(result.issues).toBeDefined()
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('validates email format', async () => {
      const schema = jsonToValibotSchema({ email: 'foo@bar.com' })
      const invalidResult = await (schema as any)['~standard'].validate({ email: 'not-an-email' })
      expect(invalidResult.issues).toBeDefined()

      const validResult = await (schema as any)['~standard'].validate({ email: 'test@example.com' })
      expect(validResult.issues).toBeUndefined()
    })

    it('validates URL format', async () => {
      const schema = jsonToValibotSchema({ url: 'https://example.com' })
      const invalidResult = await (schema as any)['~standard'].validate({ url: 'not-a-url' })
      expect(invalidResult.issues).toBeDefined()

      const validResult = await (schema as any)['~standard'].validate({ url: 'https://test.com' })
      expect(validResult.issues).toBeUndefined()
    })

    it('validates ISO date format', async () => {
      const schema = jsonToValibotSchema({ date: '2024-01-15' })
      const invalidResult = await (schema as any)['~standard'].validate({ date: '15-01-2024' })
      expect(invalidResult.issues).toBeDefined()

      const validResult = await (schema as any)['~standard'].validate({ date: '2024-12-25' })
      expect(validResult.issues).toBeUndefined()
    })
  })
})
