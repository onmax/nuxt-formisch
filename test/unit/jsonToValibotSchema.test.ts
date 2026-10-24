import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { jsonToValibotSchema } from '../../src/runtime/utils/jsonToValibotSchema'

type Node = { type: string, entries?: Record<string, Node>, item?: Node, pipe?: { type: string }[] }
const node = (schema: unknown) => schema as Node
const actions = (schema: Node | undefined) => schema?.pipe?.map(action => action.type) ?? []

describe('jsonToValibotSchema', () => {
  it('infers primitives', () => {
    expect(jsonToValibotSchema('hi').type).toBe('string')
    expect(jsonToValibotSchema(1).type).toBe('number')
    expect(jsonToValibotSchema(true).type).toBe('boolean')
    expect(jsonToValibotSchema(null).type).toBe('nullable')
  })

  it.each([
    ['ada@example.com', 'email'],
    ['https://example.com', 'url'],
    ['2024-01-15', 'iso_date'],
    ['2024-01-15T10:30:00Z', 'iso_timestamp'],
  ])('detects the format of %s', (value, action) => {
    expect(actions(node(jsonToValibotSchema(value)))).toContain(action)
  })

  it('keeps other strings plain', () => {
    expect(actions(node(jsonToValibotSchema('550e8400-e29b-41d4-a716-446655440000')))).toEqual([])
    expect(actions(node(jsonToValibotSchema('mailto:x')))).toEqual([])
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

  it('stops at maxDepth', () => {
    const schema = node(jsonToValibotSchema({ a: { b: { c: { d: 1 } } } }, { maxDepth: 2 }))
    expect(schema.entries!.a!.entries!.b!.entries!.c!.type).toBe('any')
  })

  it('accepts the sample it was inferred from', () => {
    const sample = { email: 'ada@example.com', site: 'https://ada.dev', born: '1815-12-10', at: '2024-01-15T10:30:00Z', tags: ['a'], meta: null, n: 1 }
    expect(v.safeParse(jsonToValibotSchema(sample), sample).success).toBe(true)
    expect(v.safeParse(jsonToValibotSchema(sample), { ...sample, email: 'nope' }).success).toBe(false)
  })
})
