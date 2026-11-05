import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { jsonToValibotSchema } from '../../src/runtime/utils/jsonToValibotSchema'
import { introspectSchema } from '../../src/runtime/utils/introspectSchema'

type Node = { type: string, entries?: Record<string, Node>, item?: Node }
const node = (schema: unknown) => schema as Node

describe('jsonToValibotSchema', () => {
  it('infers primitives', () => {
    expect(jsonToValibotSchema('hi').type).toBe('string')
    expect(jsonToValibotSchema(1).type).toBe('number')
    expect(jsonToValibotSchema(true).type).toBe('boolean')
    expect(jsonToValibotSchema(null).type).toBe('nullable')
  })

  it.each([
    ['email', 'ada@example.com', 'grace@example.org', 'not-an-email', 'email'],
    ['HTTP URL', 'https://example.com', 'http://example.org/path', 'mailto:ada@example.com', 'url'],
    ['ISO date', '2024-01-15', '2025-12-31', '2024-01-15T10:30:00Z', 'date'],
    ['ISO timestamp', '2024-01-15T10:30:00Z', '2025-12-31T23:59:59Z', '2024-01-15', 'text'],
  ])('validates inferred %s strings', (_, sample, valid, invalid, inputType) => {
    const schema = jsonToValibotSchema(sample)
    expect(v.parse(schema, sample)).toBe(sample)
    expect(v.parse(schema, valid)).toBe(valid)
    expect(v.safeParse(schema, invalid).success).toBe(false)
    expect(introspectSchema(v.object({ value: schema })).map(field => field.constraints.format ?? 'text')).toEqual([inputType])
  })

  it.each(['550e8400-e29b-41d4-a716-446655440000', 'mailto:x'])('keeps %s as a plain string', (sample) => {
    const schema = jsonToValibotSchema(sample)
    expect(v.parse(schema, sample)).toBe(sample)
    expect(v.parse(schema, 'ordinary text')).toBe('ordinary text')
    expect(v.safeParse(schema, 42).success).toBe(false)
  })

  it('infers arrays from their non-null items', () => {
    expect(node(jsonToValibotSchema([1, 2])).item?.type).toBe('number')
    expect(node(jsonToValibotSchema([null, 'a'])).item?.type).toBe('string')
    expect(node(jsonToValibotSchema([])).item?.type).toBe('string')
    expect(node(jsonToValibotSchema([1, 'a'])).item?.type).toBe('any')
    expect(node(jsonToValibotSchema([{ a: 1 }])).item?.type).toBe('object')
  })

  it('titles object keys in a human way', () => {
    const schema = jsonToValibotSchema({ 'user_name': 'a', 'firstName': 'b', 'config-value': 'c', 'XMLParser': 'd', 'nested': { deep_key: 1 } })
    expect(v.getTitle(node(schema).entries!.user_name as v.GenericSchema)).toBe('User Name')
    expect(v.getTitle(node(schema).entries!.firstName as v.GenericSchema)).toBe('First Name')
    expect(v.getTitle(node(schema).entries!['config-value'] as v.GenericSchema)).toBe('Config Value')
    expect(v.getTitle(node(schema).entries!.XMLParser as v.GenericSchema)).toBe('XML Parser')
    expect(v.getTitle(node(schema).entries!.nested!.entries!.deep_key as v.GenericSchema)).toBe('Deep Key')
  })

  it('stops validation below maxDepth while checking parent objects', () => {
    const schema = jsonToValibotSchema({ a: { b: { c: { d: 1 } } } }, { maxDepth: 2 })
    const relaxed = { a: { b: { c: 'any value' } } }
    expect(v.parse(schema, relaxed)).toEqual(relaxed)
    expect(v.safeParse(schema, { a: { b: 42 } }).success).toBe(false)
  })

  it('accepts the sample it was inferred from', () => {
    const sample = { email: 'ada@example.com', site: 'https://ada.dev', born: '1815-12-10', at: '2024-01-15T10:30:00Z', tags: ['a'], meta: null, n: 1 }
    expect(v.safeParse(jsonToValibotSchema(sample), sample).success).toBe(true)
  })
})
