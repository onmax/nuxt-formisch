import { splitByCase, upperFirst } from 'scule'
import * as v from 'valibot'

export interface JsonToSchemaOptions {
  maxDepth?: number
}

const EMAIL_REGEX = /@.*\./
const URL_REGEX = /^https?:\/\//
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}/

function humanize(key: string): string {
  return splitByCase(key).map(upperFirst).join(' ')
}

function inferStringSchema(value: string, key?: string): v.GenericSchema {
  if (EMAIL_REGEX.test(value)) return key ? v.pipe(v.string(), v.email(), v.title(humanize(key))) : v.pipe(v.string(), v.email())
  if (URL_REGEX.test(value)) return key ? v.pipe(v.string(), v.url(), v.title(humanize(key))) : v.pipe(v.string(), v.url())
  if (ISO_DATE_REGEX.test(value)) return key ? v.pipe(v.string(), v.isoDate(), v.title(humanize(key))) : v.pipe(v.string(), v.isoDate())
  return key ? v.pipe(v.string(), v.title(humanize(key))) : v.string()
}

function getCommonType(items: unknown[]): 'string' | 'number' | 'boolean' | 'object' | 'mixed' {
  const types = new Set(items.map((item) => {
    if (item === null || item === undefined) return 'null'
    if (Array.isArray(item)) return 'array'
    return typeof item
  }))
  types.delete('null')
  if (types.size === 0) return 'string'
  if (types.size === 1) {
    const type = [...types][0]
    if (type === 'string' || type === 'number' || type === 'boolean' || type === 'object') return type
  }
  return 'mixed'
}

function inferArraySchema(value: unknown[], depth: number, maxDepth: number): v.GenericSchema {
  if (value.length === 0) return v.array(v.string())

  const commonType = getCommonType(value)
  if (commonType === 'mixed') return v.array(v.any())

  const firstNonNull = value.find(item => item !== null && item !== undefined)
  if (firstNonNull === undefined) return v.array(v.string())

  return v.array(infer(firstNonNull, depth, maxDepth))
}

function infer(value: unknown, depth: number, maxDepth: number, key?: string): v.GenericSchema {
  if (depth > maxDepth) return key ? v.pipe(v.any(), v.title(humanize(key))) : v.any()

  if (value === null || value === undefined) {
    const schema = v.nullable(v.any())
    return key ? v.pipe(schema, v.title(humanize(key))) : schema
  }

  switch (typeof value) {
    case 'string':
      return inferStringSchema(value, key)
    case 'number': {
      const schema = v.number()
      return key ? v.pipe(schema, v.title(humanize(key))) : schema
    }
    case 'boolean': {
      const schema = v.boolean()
      return key ? v.pipe(schema, v.title(humanize(key))) : schema
    }
    case 'object':
      if (Array.isArray(value)) {
        const schema = inferArraySchema(value, depth + 1, maxDepth)
        return key ? v.pipe(schema, v.title(humanize(key))) : schema
      }
      return v.object(
        Object.fromEntries(
          Object.entries(value as Record<string, unknown>)
            .map(([k, val]) => [k, infer(val, depth + 1, maxDepth, k)]),
        ),
      )
    default: {
      const schema = v.any()
      return key ? v.pipe(schema, v.title(humanize(key))) : schema
    }
  }
}

export function jsonToValibotSchema(value: unknown, options: JsonToSchemaOptions = {}): v.GenericSchema {
  const maxDepth = options.maxDepth ?? 10
  return infer(value, 0, maxDepth)
}
