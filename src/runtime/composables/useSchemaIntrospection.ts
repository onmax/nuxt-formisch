import type { Component } from 'vue'

export interface FieldConstraints {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  integer?: boolean
  email?: boolean
}

export interface FieldUI {
  label?: string
  description?: string
  unit?: string
  section?: string
  placeholder?: string
  component?: Component
}

export interface FieldConfig {
  label?: string
  placeholder?: string
  description?: string
  unit?: string
  component?: Component
  componentProps?: Record<string, unknown>
  section?: string
  order?: number
  hidden?: boolean
  colSpan?: number
  disabled?: boolean
}

export interface ResolvedField {
  name: string
  path: (string | number)[]
  type: 'string' | 'number' | 'boolean' | 'picklist' | 'enum' | 'object' | 'array'
  required: boolean
  constraints: FieldConstraints
  ui: FieldUI
  options?: { label: string, value: string | number }[]
  children?: ResolvedField[]
  itemSchema?: ResolvedField[]
}

interface SchemaLike {
  kind?: string
  type?: string
  pipe?: SchemaLike[]
  entries?: Record<string, SchemaLike>
  item?: SchemaLike
  options?: unknown[]
  enum?: Record<string, unknown>
  wrapped?: SchemaLike
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

function unwrapSchema(schema: SchemaLike): { inner: SchemaLike, required: boolean } {
  let required = true
  let current = schema
  while (current.type === 'optional' || current.type === 'nullable' || current.type === 'nullish') {
    if (!current.wrapped) break
    required = false
    current = current.wrapped
  }
  return { inner: current, required }
}

function extractPipeInfo(schema: SchemaLike): { constraints: FieldConstraints, ui: FieldUI } {
  const constraints: FieldConstraints = {}
  const ui: FieldUI = {}

  if (!('pipe' in schema) || !Array.isArray(schema.pipe))
    return { constraints, ui }

  for (const item of schema.pipe) {
    if (item.kind === 'validation') {
      switch (item.type) {
        case 'min_value':
          constraints.min = item.requirement as number
          break
        case 'max_value':
          constraints.max = item.requirement as number
          break
        case 'min_length':
          constraints.minLength = item.requirement as number
          break
        case 'max_length':
          constraints.maxLength = item.requirement as number
          break
        case 'email':
          constraints.email = true
          break
        case 'integer':
          constraints.integer = true
          break
      }
    }
    else if (item.kind === 'metadata') {
      if (item.type === 'title') ui.label = item.title as string
      else if (item.type === 'description') ui.description = item.description as string
      else if (item.type === 'metadata') {
        const meta = item.metadata as Record<string, unknown>
        if (meta.unit) ui.unit = meta.unit as string
        if (meta.section) ui.section = meta.section as string
        if (meta.placeholder) ui.placeholder = meta.placeholder as string
        if (meta.component) ui.component = meta.component as Component
      }
    }
  }

  return { constraints, ui }
}

function resolveBaseType(schema: SchemaLike): ResolvedField['type'] {
  switch (schema.type) {
    case 'string': return 'string'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    case 'picklist': return 'picklist'
    case 'enum': return 'enum'
    case 'object': return 'object'
    case 'array': return 'array'
    default: return 'string'
  }
}

function extractOptions(schema: SchemaLike): ResolvedField['options'] {
  if (schema.type === 'picklist' && Array.isArray(schema.options)) {
    return schema.options.map(o => ({ label: String(o), value: o as string | number }))
  }
  if (schema.type === 'enum' && Array.isArray(schema.options)) {
    return schema.options.map(o => ({ label: String(o), value: o as string | number }))
  }
  return undefined
}

function resolveField(schema: SchemaLike, name: string, path: (string | number)[] = [name]): ResolvedField {
  const { inner, required } = unwrapSchema(schema)
  const { constraints, ui } = extractPipeInfo(inner)
  const type = resolveBaseType(inner)
  const field: ResolvedField = { name, path, type, required, constraints, ui }

  if (type === 'picklist' || type === 'enum')
    field.options = extractOptions(inner)

  if (type === 'object' && inner.entries) {
    field.children = Object.entries(inner.entries).map(
      ([key, childSchema]) => resolveField(childSchema as SchemaLike, key, [...path, key]),
    )
  }

  if (type === 'array' && inner.item) {
    const itemSchema = inner.item as SchemaLike
    if (itemSchema.type === 'object' && itemSchema.entries) {
      field.itemSchema = Object.entries(itemSchema.entries).map(
        ([key, childSchema]) => resolveField(childSchema as SchemaLike, key, [key]),
      )
    }
    else {
      field.itemSchema = [resolveField(itemSchema, 'value', ['value'])]
    }
  }

  return field
}

function applyFieldConfig(fields: ResolvedField[], config?: Record<string, FieldConfig>): ResolvedField[] {
  if (!config) return fields

  return fields.map((field) => {
    const override = config[field.name]
    if (!override) return field

    const merged = { ...field }
    merged.ui = { ...field.ui }
    if (override.label) merged.ui.label = override.label
    if (override.description) merged.ui.description = override.description
    if (override.unit) merged.ui.unit = override.unit
    if (override.placeholder) merged.ui.placeholder = override.placeholder
    if (override.component) merged.ui.component = override.component
    if (override.section) merged.ui.section = override.section

    return merged
  })
}

export function introspectSchema(schema: SchemaLike, fieldConfig?: Record<string, FieldConfig>): ResolvedField[] {
  if (schema.type !== 'object' || !schema.entries)
    throw new Error('introspectSchema expects a valibot object schema')

  // Unwrap pipe if present (v.pipe(v.object({...}), ...))
  const entries = schema.entries as Record<string, SchemaLike>
  const fields = Object.entries(entries).map(
    ([name, fieldSchema]) => resolveField(fieldSchema, name),
  )

  return applyFieldConfig(fields, fieldConfig)
}
