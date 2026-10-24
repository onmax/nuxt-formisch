import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import * as v from 'valibot'

/** One validation problem, as sent to the client in `error.data.issues`. */
export interface FormIssue {
  message: string
  /** Path of the field, e.g. `['members', 0, 'name']`. Empty for form-level issues. */
  path: (string | number)[]
}

/** The `data` of the 400 error thrown by `readValidatedFormBody()`. */
export interface FormValidationErrorData {
  issues: FormIssue[]
}

const PathSegment = v.object({ key: v.unknown() })
const NumberKey = v.number()

/** Standard Schema path items are keys or `{ key }` objects. JSON needs strings or numbers. */
function toPathKey(segment: unknown): string | number {
  const key = v.is(PathSegment, segment) ? segment.key : segment
  return v.is(NumberKey, key) ? key : String(key)
}

/**
 * Reads the request body (JSON or URL-encoded) and validates it with a
 * Valibot schema, or any other Standard Schema. Returns the typed output, or
 * throws a `400 Validation Error` whose `data.issues` lists every problem.
 *
 * @example
 * ```ts
 * // server/api/profile.post.ts
 * export default defineEventHandler(async (event) => {
 *   const profile = await readValidatedFormBody(event, profileSchema)
 *   return { saved: profile.email }
 * })
 * ```
 */
export async function readValidatedFormBody<TSchema extends StandardSchemaV1>(
  event: H3Event,
  schema: TSchema,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  const body = await readBody(event, { strict: true })
  const result = await schema['~standard'].validate(body)
  if (!result.issues) return result.value

  const issues: FormIssue[] = result.issues.map(issue => ({
    message: issue.message,
    path: (issue.path ?? []).map(toPathKey),
  }))
  throw createError<FormValidationErrorData>({
    statusCode: 400,
    statusMessage: 'Validation Error',
    message: issues[0]?.message ?? 'Validation Error',
    data: { issues },
  })
}
