/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import * as v from 'valibot'
import { useFormValidation } from '../../src/runtime/server/useFormValidation'

// Mock H3 event
function createMockEvent(body: unknown) {
  return {
    node: { req: { body } },
    _requestBody: body,
    body,
  } as any
}

// Mock h3 readValidatedBody
vi.mock('h3', () => ({
  createError: (opts: any) => {
    const err = new Error(opts.message) as any
    err.statusCode = opts.statusCode
    err.statusMessage = opts.statusMessage
    err.data = opts.data
    return err
  },
  readValidatedBody: async (_event: any, validator: any) => {
    const body = _event.body
    return validator(body)
  },
}))

describe('useFormValidation', () => {
  const schema = v.object({
    email: v.pipe(v.string(), v.email()),
    age: v.pipe(v.number(), v.minValue(18)),
  })

  it('returns validated data for valid input', async () => {
    const event = createMockEvent({ email: 'test@example.com', age: 25 })
    const result = await useFormValidation(event, schema)

    expect(result).toEqual({ email: 'test@example.com', age: 25 })
  })

  it('throws error for invalid email', async () => {
    const event = createMockEvent({ email: 'not-an-email', age: 25 })

    await expect(useFormValidation(event, schema)).rejects.toThrow()
  })

  it('throws error for age under minimum', async () => {
    const event = createMockEvent({ email: 'test@example.com', age: 15 })

    await expect(useFormValidation(event, schema)).rejects.toThrow()
  })

  it('throws error with validation issues for invalid data', async () => {
    const event = createMockEvent({ email: 'invalid', age: 10 })

    try {
      await useFormValidation(event, schema)
      expect.fail('Should have thrown')
    }
    catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.statusMessage).toBe('Validation Error')
      expect(err.data.issues).toBeDefined()
      expect(err.data.issues.length).toBeGreaterThan(0)
    }
  })

  it('throws error for missing required fields', async () => {
    const event = createMockEvent({ email: 'test@example.com' })

    await expect(useFormValidation(event, schema)).rejects.toThrow()
  })

  it('works with optional fields', async () => {
    const schemaWithOptional = v.object({
      name: v.string(),
      bio: v.optional(v.string()),
    })
    const event = createMockEvent({ name: 'John' })
    const result = await useFormValidation(event, schemaWithOptional)

    expect(result).toEqual({ name: 'John' })
  })

  it('coerces types via standard schema', async () => {
    const event = createMockEvent({ email: 'test@example.com', age: 25 })
    const result = await useFormValidation(event, schema)

    expect(typeof result.age).toBe('number')
    expect(typeof result.email).toBe('string')
  })

  it('validates nested objects', async () => {
    const nestedSchema = v.object({
      user: v.object({ name: v.string(), email: v.pipe(v.string(), v.email()) }),
    })
    const event = createMockEvent({ user: { name: 'John', email: 'john@example.com' } })
    const result = await useFormValidation(event, nestedSchema)

    expect(result).toEqual({ user: { name: 'John', email: 'john@example.com' } })
  })

  it('rejects invalid nested objects', async () => {
    const nestedSchema = v.object({
      user: v.object({ name: v.string(), email: v.pipe(v.string(), v.email()) }),
    })
    const event = createMockEvent({ user: { name: 'John', email: 'not-email' } })

    await expect(useFormValidation(event, nestedSchema)).rejects.toThrow()
  })

  it('validates arrays', async () => {
    const arraySchema = v.object({
      tags: v.array(v.string()),
    })
    const event = createMockEvent({ tags: ['a', 'b', 'c'] })
    const result = await useFormValidation(event, arraySchema)

    expect(result).toEqual({ tags: ['a', 'b', 'c'] })
  })
})
