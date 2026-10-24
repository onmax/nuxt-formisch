import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { useForm } from '@formisch/vue'
import { introspectSchema, toFormSchema } from '../../src/runtime/utils/introspectSchema'

describe('introspectSchema', () => {
  it('resolves leaf types, labels and required', () => {
    const [name, age, active, bio] = introspectSchema(v.object({
      name: v.string(),
      age: v.number(),
      isActive: v.boolean(),
      bio: v.optional(v.string()),
    }))
    expect(name).toMatchObject({ key: 'name', type: 'string', label: 'Name', required: true })
    expect(age).toMatchObject({ type: 'number' })
    expect(active).toMatchObject({ type: 'boolean', label: 'Is Active' })
    expect(bio).toMatchObject({ type: 'string', required: false })
  })

  it.each([
    ['nullable', v.nullable(v.string())],
    ['nullish', v.nullish(v.string())],
    ['exactOptional', v.exactOptional(v.string())],
  ])('treats %s as optional', (_, schema) => {
    expect(introspectSchema(v.object({ x: schema }))[0]!.required).toBe(false)
  })

  it('turns picklists, enums and literal unions into options', () => {
    const [role, status, size] = introspectSchema(v.object({
      role: v.picklist(['admin', 'user']),
      status: v.enum({ Active: 'active', Paused: 'paused' }),
      size: v.union([v.literal('s'), v.literal('m')]),
    }))
    expect(role).toMatchObject({ type: 'enum', options: [{ label: 'admin', value: 'admin' }, { label: 'user', value: 'user' }] })
    expect(status!.options).toEqual([{ label: 'Active', value: 'active' }, { label: 'Paused', value: 'paused' }])
    expect(size!.options!.map(option => option.value)).toEqual(['s', 'm'])
  })

  it('reads constraints from the pipe', () => {
    const [age, name, email, site, born] = introspectSchema(v.object({
      age: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(120)),
      name: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
      email: v.pipe(v.string(), v.email()),
      site: v.pipe(v.string(), v.url()),
      born: v.pipe(v.string(), v.isoDate()),
    }))
    expect(age!.constraints).toEqual({ integer: true, min: 0, max: 120 })
    expect(name!.constraints).toEqual({ minLength: 2, maxLength: 50 })
    expect(email!.constraints.format).toBe('email')
    expect(site!.constraints.format).toBe('url')
    expect(born!.constraints.format).toBe('date')
  })

  it('reads title, description and metadata, outer schema first', () => {
    const [age, bio] = introspectSchema(v.object({
      age: v.pipe(v.number(), v.title('Age'), v.description('In years'), v.metadata({ unit: 'y', section: 'Personal', placeholder: '18' })),
      bio: v.pipe(v.optional(v.pipe(v.string(), v.title('Inner'), v.metadata({ type: 'textarea' }))), v.title('Biography')),
    }))
    expect(age).toMatchObject({ label: 'Age', description: 'In years', unit: 'y', section: 'Personal', placeholder: '18' })
    expect(bio).toMatchObject({ label: 'Biography', type: 'textarea', required: false })
  })

  it('resolves nested objects and arrays with dotted keys', () => {
    const [address, members, tags] = introspectSchema(v.object({
      address: v.object({ city: v.string() }),
      members: v.array(v.object({ name: v.string(), filters: v.array(v.string()) })),
      tags: v.array(v.pipe(v.string(), v.title('Tag'))),
    }))
    expect(address).toMatchObject({ type: 'object', fields: [{ key: 'address.city', name: 'city' }] })
    expect(members!.item).toMatchObject({ type: 'object', label: '', fields: [{ key: 'members.name' }, { key: 'members.filters', type: 'array' }] })
    expect(members!.item!.fields![1]!.item).toMatchObject({ type: 'string', label: '' })
    expect(tags!.item).toMatchObject({ type: 'string', label: '' })
  })

  it('renders records, unknown and json metadata as JSON', () => {
    const fields = introspectSchema(v.object({
      map: v.pipe(v.record(v.string(), v.string()), v.title('Map')),
      any: v.unknown(),
      raw: v.pipe(v.string(), v.metadata({ type: 'json' })),
    }))
    expect(fields.map(field => field.type)).toEqual(['json', 'json', 'json'])
    expect(fields[0]!.label).toBe('Map')
  })

  it('applies field config by dotted key over schema metadata', () => {
    const fields = introspectSchema(v.object({
      a: v.pipe(v.string(), v.title('A'), v.metadata({ order: 2 })),
      b: v.string(),
      c: v.object({ d: v.string() }),
      e: v.string(),
    }), {
      'a': { description: 'desc' },
      'b': { order: 1, label: 'Bee' },
      'c.d': { label: 'Dee' },
      'e': { hidden: true },
    })
    expect(fields.map(field => field.key)).toEqual(['c', 'b', 'a'])
    expect(fields[2]).toMatchObject({ label: 'A', description: 'desc' })
    expect(fields[1]!.label).toBe('Bee')
    expect(fields[0]!.fields![0]!.label).toBe('Dee')
  })

  it('throws for non-object schemas', () => {
    expect(() => introspectSchema(v.string())).toThrow('expects a Valibot object schema, got "string"')
  })
})

describe('toFormSchema', () => {
  const schema = v.object({
    name: v.string(),
    mappings: v.optional(v.record(v.string(), v.number())),
    rows: v.array(v.object({ meta: v.record(v.string(), v.string()) })),
  })

  it('lets Formisch build a store for schemas with records', () => {
    expect(() => useForm({ schema })).toThrow('"record" schema is not supported')
    expect(() => useForm({ schema: toFormSchema(schema) })).not.toThrow()
  })

  it('still validates records with the original schema', () => {
    const formSchema = toFormSchema(schema)
    expect(v.safeParse(formSchema, { name: 'a', mappings: { x: 1 }, rows: [{ meta: { k: 'v' } }] }).success).toBe(true)
    const result = v.safeParse(formSchema, { name: 'a', mappings: { x: 'no' }, rows: [] })
    expect(result.success).toBe(false)
    expect(v.getDotPath(result.issues![0]!)).toBe('mappings.x')
  })

  it('returns the same schema when nothing needs wrapping', () => {
    const plain = v.object({ a: v.string(), b: v.array(v.number()) })
    expect(toFormSchema(plain)).toBe(plain)
  })
})
