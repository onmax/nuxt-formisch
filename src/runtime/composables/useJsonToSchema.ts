import * as v from 'valibot'

/**
 * Infer a valibot schema from a JSON value at runtime.
 * Useful for unknown/dynamic configs where no hand-written schema exists.
 *
 * Limitations: no constraints, labels, or picklist detection — just shape.
 */
export function jsonToValibotSchema(value: unknown): v.GenericSchema {
  if (value === null || value === undefined)
    return v.nullable(v.any())

  switch (typeof value) {
    case 'string':
      return v.string()
    case 'number':
      return v.number()
    case 'boolean':
      return v.boolean()
    case 'object':
      if (Array.isArray(value)) {
        if (value.length === 0) return v.array(v.any())
        return v.array(jsonToValibotSchema(value[0]))
      }
      return v.object(
        Object.fromEntries(
          Object.entries(value as Record<string, unknown>)
            .map(([k, val]) => [k, jsonToValibotSchema(val)]),
        ),
      )
    default:
      return v.any()
  }
}
