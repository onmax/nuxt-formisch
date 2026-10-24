import * as v from 'valibot'
import { humanize } from './humanize'

export interface JsonToValibotSchemaOptions {
  /** Nesting depth after which values become `v.any()`. @default 10 */
  maxDepth?: number
}

const HTTP_URL = /^https?:\/\/\S+$/
const STRING_FORMATS = [
  v.pipe(v.string(), v.email()),
  v.pipe(v.string(), v.regex(HTTP_URL), v.url()),
  v.pipe(v.string(), v.isoDate()),
  v.pipe(v.string(), v.isoTimestamp()),
]

function inferString(value: string): v.GenericSchema<string> {
  return STRING_FORMATS.find(schema => v.is(schema, value)) ?? v.string()
}

type JsonKind = 'null' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'other'

const Json = {
  string: v.string(),
  number: v.number(),
  boolean: v.boolean(),
  array: v.array(v.unknown()),
  object: v.record(v.string(), v.unknown()),
}

function kindOf(value: unknown): JsonKind {
  if (value === null || value === undefined) return 'null'
  if (v.is(Json.string, value)) return 'string'
  if (v.is(Json.number, value)) return 'number'
  if (v.is(Json.boolean, value)) return 'boolean'
  // Arrays first: they also pass the record check.
  if (v.is(Json.array, value)) return 'array'
  if (v.is(Json.object, value)) return 'object'
  return 'other'
}

function inferArray(items: unknown[], depth: number, maxDepth: number): v.GenericSchema {
  const present = items.filter(item => kindOf(item) !== 'null')
  const kinds = new Set(present.map(kindOf))
  if (kinds.size === 0) return v.array(v.string())
  if (kinds.size > 1) return v.array(v.any())
  return v.array(infer(present[0], depth + 1, maxDepth))
}

function infer(value: unknown, depth: number, maxDepth: number): v.GenericSchema {
  if (depth > maxDepth) return v.any()
  if (value === null || value === undefined) return v.nullable(v.any())
  if (v.is(Json.string, value)) return inferString(value)
  if (v.is(Json.number, value)) return v.number()
  if (v.is(Json.boolean, value)) return v.boolean()
  // Arrays first: they also pass the record check.
  if (v.is(Json.array, value)) return inferArray(value, depth, maxDepth)
  if (v.is(Json.object, value)) {
    return v.object(Object.fromEntries(Object.entries(value).map(([key, entry]) => {
      const schema = infer(entry, depth + 1, maxDepth)
      return [key, v.pipe(schema, v.title(humanize(key)))]
    })))
  }
  return v.any()
}

/**
 * Infers a Valibot schema from a sample JSON value, so you can render or
 * validate data whose shape you only know at runtime. Object keys get a
 * humanized `v.title()` (`user_name` becomes `User Name`) and strings that look
 * like emails, http(s) URLs, ISO dates or ISO timestamps get the matching check.
 * The sample itself always passes the inferred schema.
 *
 * @example
 * ```vue
 * <FAutoForm :schema="jsonToValibotSchema(settings)" :initial-input="settings" />
 * ```
 */
export function jsonToValibotSchema(value: Record<string, unknown>, options?: JsonToValibotSchemaOptions): v.GenericSchema<Record<string, unknown>>
export function jsonToValibotSchema(value: unknown, options?: JsonToValibotSchemaOptions): v.GenericSchema
export function jsonToValibotSchema(value: unknown, options: JsonToValibotSchemaOptions = {}): v.GenericSchema {
  return infer(value, 0, options.maxDepth ?? 10)
}
