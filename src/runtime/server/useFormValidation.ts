import type { H3Event } from 'h3'
import type { BaseIssue, BaseSchema, InferOutput } from 'valibot'
import { readValidatedBody } from 'h3'
import { parse } from 'valibot'

/**
 * Server-side form validation composable
 * Validates request body against a Valibot schema using h3's readValidatedBody
 *
 * @example
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   const data = await useFormValidation(event, loginSchema)
 *   return { user: data.email }
 * })
 * ```
 */
export async function useFormValidation<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  event: H3Event,
  schema: TSchema,
): Promise<InferOutput<TSchema>> {
  // Wrap Valibot schema in a validation function for h3
  return await readValidatedBody(event, data => parse(schema, data))
}
