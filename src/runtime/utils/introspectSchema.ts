import type { Component } from 'vue'
import * as v from 'valibot'
import { humanize } from './humanize'

type AnySchema = v.GenericSchema | v.GenericSchemaAsync

/** How `<FAutoForm>` renders a field. */
export type FieldType = 'string' | 'textarea' | 'number' | 'boolean' | 'enum' | 'object' | 'array' | 'json'

/**
 * Per-field UI options. Set them in the schema with `v.metadata({ ... })`
 * (everything except `component`/`componentProps`), or per form with the
 * `field-config` prop of `<FAutoForm>`, keyed by the field's dotted key
 * (array indexes left out, e.g. `members.name`). The prop wins.
 */
export interface FieldConfig {
  label?: string
  description?: string
  placeholder?: string
  /** Text shown after the input, e.g. `kg` or `%`. */
  unit?: string
  /** Groups top-level fields under a heading. */
  section?: string
  /** Sort order among siblings. Lower comes first; unset counts as 0. */
  order?: number
  hidden?: boolean
  /** Number of grid columns the field spans. */
  colSpan?: number
  disabled?: boolean
  /** Render a string as a `<UTextarea>`, or any value as editable JSON. */
  type?: 'textarea' | 'json'
  /** Replaces the input. It receives `modelValue`, `onUpdate:modelValue` and `disabled`. */
  component?: Component
  componentProps?: Record<string, unknown>
}

export interface FieldConstraints {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  integer?: boolean
  format?: 'email' | 'url' | 'date'
}

export interface FieldOption {
  label: string
  value: string | number
}

/** A schema entry resolved into everything needed to render it. */
export interface ResolvedField extends Omit<FieldConfig, 'type' | 'label'> {
  /** Dotted path without array indexes, e.g. `address.city` or `members.name`. */
  key: string
  /** The entry key in its parent object (empty for array items). */
  name: string
  type: FieldType
  label: string
  required: boolean
  constraints: FieldConstraints
  /** Choices of an `enum` field. */
  options?: FieldOption[]
  /** Child fields of an `object` field. */
  fields?: ResolvedField[]
  /** Item field of an `array` field. */
  item?: ResolvedField
}

/** The parts of a Valibot schema introspection reads. Every Valibot schema matches it. */
type SchemaNode = AnySchema & {
  pipe?: readonly { kind: string, type: string, requirement?: unknown }[]
  entries?: Record<string, SchemaNode>
  item?: SchemaNode
  wrapped?: SchemaNode
  options?: readonly unknown[]
  enum?: Record<string, unknown>
}

const WRAPPERS = new Set(['optional', 'exact_optional', 'nullable', 'nullish', 'undefinedable', 'non_optional', 'non_nullable', 'non_nullish'])
const OPTIONAL_WRAPPERS = new Set(['optional', 'exact_optional', 'nullable', 'nullish', 'undefinedable'])
const OBJECTS = new Set(['object', 'loose_object', 'strict_object'])
/** Schemas Formisch can't build a field store for. `<FAutoForm>` edits them as JSON. */
const UNSUPPORTED = new Set(['record', 'object_with_rest', 'tuple_with_rest'])
const JSON_TYPES = new Set([...UNSUPPORTED, 'unknown', 'any'])

/** `v.metadata()` keys read as UI options. Values of the wrong type are ignored. */
const UiMetadata = v.object({
  label: v.fallback(v.optional(v.string()), undefined),
  description: v.fallback(v.optional(v.string()), undefined),
  placeholder: v.fallback(v.optional(v.string()), undefined),
  unit: v.fallback(v.optional(v.string()), undefined),
  section: v.fallback(v.optional(v.string()), undefined),
  order: v.fallback(v.optional(v.number()), undefined),
  hidden: v.fallback(v.optional(v.boolean()), undefined),
  colSpan: v.fallback(v.optional(v.number()), undefined),
  disabled: v.fallback(v.optional(v.boolean()), undefined),
  type: v.fallback(v.optional(v.picklist(['textarea', 'json'])), undefined),
})
const OptionValue = v.union([v.string(), v.number()])
const LiteralSchema = v.object({ type: v.literal('literal'), literal: OptionValue })

/** Collects title, description, `v.metadata()` UI keys and validation constraints from one schema level. */
function readPipe(schema: SchemaNode, ui: FieldConfig, constraints: FieldConstraints) {
  const meta = v.parse(UiMetadata, v.getMetadata(schema))
  for (const [key, value] of Object.entries(meta)) {
    if (value !== undefined) Object.assign(ui, { [key]: value })
  }
  const title = v.getTitle(schema)
  const description = v.getDescription(schema)
  if (title) ui.label = title
  if (description) ui.description = description

  for (const action of schema.pipe ?? []) {
    if (action.kind !== 'validation') continue
    switch (action.type) {
      case 'min_value':
        constraints.min = Number(action.requirement)
        break
      case 'max_value':
        constraints.max = Number(action.requirement)
        break
      case 'min_length':
        constraints.minLength = Number(action.requirement)
        break
      case 'max_length':
        constraints.maxLength = Number(action.requirement)
        break
      case 'integer':
        constraints.integer = true
        break
      case 'email':
      case 'rfc_email':
        constraints.format = 'email'
        break
      case 'url':
        constraints.format = 'url'
        break
      case 'iso_date':
        constraints.format = 'date'
        break
    }
  }
}

function enumOptions(schema: SchemaNode): FieldOption[] | undefined {
  const values = schema.options?.filter(value => v.is(OptionValue, value)) ?? []
  if (schema.type === 'picklist') {
    return values.map(value => ({ label: String(value), value }))
  }
  if (schema.type === 'enum' && schema.enum) {
    return Object.entries(schema.enum)
      .filter(([key, value]) => Number.isNaN(Number(key)) && v.is(OptionValue, value))
      .map(([label, value]) => ({ label, value: v.parse(OptionValue, value) }))
  }
  const literals = schema.options?.filter(option => v.is(LiteralSchema, option)) ?? []
  if (schema.type === 'union' && literals.length && literals.length === schema.options?.length) {
    return literals.map(({ literal }) => ({ label: String(literal), value: literal }))
  }
}

function resolveType(schema: SchemaNode, options: FieldOption[] | undefined): FieldType {
  if (options) return 'enum'
  if (JSON_TYPES.has(schema.type)) return 'json'
  if (OBJECTS.has(schema.type)) return 'object'
  if (schema.type === 'array') return 'array'
  if (schema.type === 'number' || schema.type === 'boolean') return schema.type
  return 'string'
}

/** `isItem` marks an array item: it shares the array's key, so it skips the array's config and label. */
function resolveField(schema: SchemaNode, name: string, key: string, config: Record<string, FieldConfig> | undefined, isItem = false): ResolvedField {
  const ui: FieldConfig = {}
  const constraints: FieldConstraints = {}
  const levels: SchemaNode[] = [schema]
  let required = true
  let inner = schema
  while (WRAPPERS.has(inner.type) && inner.wrapped) {
    if (OPTIONAL_WRAPPERS.has(inner.type)) required = false
    inner = inner.wrapped
    levels.push(inner)
  }
  // Innermost first so metadata on the outer schema wins.
  for (const level of levels.reverse()) readPipe(level, ui, constraints)
  if (!isItem) Object.assign(ui, config?.[key])

  const options = enumOptions(inner)
  const { type: uiType, label, ...rest } = ui
  let type = resolveType(inner, options)
  if (uiType === 'json' || (uiType === 'textarea' && type === 'string')) type = uiType

  const field: ResolvedField = { ...rest, key, name, type, label: isItem ? '' : label ?? humanize(name), required, constraints }
  if (options) field.options = options
  if (type === 'object' && inner.entries) field.fields = resolveEntries(inner.entries, key, config)
  if (type === 'array' && inner.item) field.item = resolveField(inner.item, '', key, config, true)
  return field
}

function resolveEntries(entries: Record<string, SchemaNode>, parentKey: string, config: Record<string, FieldConfig> | undefined): ResolvedField[] {
  return Object.entries(entries)
    .map(([name, schema]) => resolveField(schema, name, parentKey ? `${parentKey}.${name}` : name, config))
    .filter(field => !field.hidden)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/**
 * Turns a Valibot object schema into the field tree `<FAutoForm>` renders.
 * Hidden fields are dropped and siblings are sorted by `order`.
 *
 * @param schema A Valibot object schema (`v.object`, `v.looseObject`, `v.strictObject`, optionally piped).
 * @param fieldConfig Per-field overrides keyed by dotted key, e.g. `{ 'address.city': { label: 'Town' } }`.
 *
 * @example
 * ```ts
 * const fields = introspectSchema(v.object({ email: v.pipe(v.string(), v.email()) }))
 * // [{ key: 'email', type: 'string', label: 'Email', constraints: { format: 'email' }, ... }]
 * ```
 */
export function introspectSchema(schema: AnySchema, fieldConfig?: Record<string, FieldConfig>): ResolvedField[] {
  const node: SchemaNode = schema
  if (!OBJECTS.has(node.type) || !node.entries) {
    throw new TypeError(`[nuxt-formisch] introspectSchema() expects a Valibot object schema, got "${node.type}".`)
  }
  return resolveEntries(node.entries, '', fieldConfig)
}

/**
 * Returns a copy of `schema` that Formisch can build a form store for: every
 * schema Formisch rejects (e.g. `v.record`) is swapped for an `unknown` schema
 * that still validates with the original. The input schema is not modified.
 */
export function toFormSchema<TSchema extends AnySchema>(schema: TSchema): TSchema {
  const copy = wrapUnsupported(schema)
  // SAFETY: the copy has every property of `schema`; only nested schemas Formisch rejects are swapped for
  // schemas that accept and output the same values, so it still satisfies `TSchema`.
  return copy as TSchema
}

function wrapUnsupported(schema: SchemaNode): SchemaNode {
  if (UNSUPPORTED.has(schema.type)) {
    // Formisch sees a plain value field; validation still runs the original schema.
    return schema.async
      ? { ...v.unknown(), 'async': true, '~run': schema['~run'].bind(schema) }
      : { ...v.unknown(), '~run': schema['~run'].bind(schema) }
  }
  if (schema.entries) {
    let changed = false
    const entries = Object.fromEntries(Object.entries(schema.entries).map(([key, entry]) => {
      const next = wrapUnsupported(entry)
      changed ||= next !== entry
      return [key, next]
    }))
    return changed ? { ...schema, entries } : schema
  }
  for (const prop of ['item', 'wrapped'] as const) {
    const child = schema[prop]
    if (!child) continue
    const next = wrapUnsupported(child)
    return next === child ? schema : { ...schema, [prop]: next }
  }
  return schema
}
