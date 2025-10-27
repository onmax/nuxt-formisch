import type { H3Event, ValidateFunction } from 'h3'
import { readValidatedBody } from 'h3'
import type { BaseSchema, BaseIssue, InferOutput } from 'valibot'

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
  // h3's readValidatedBody supports Standard-Schema compatible validators
  // Valibot v1+ implements Standard Schema spec - cast needed for h3 types
  return await readValidatedBody(event, schema as unknown as ValidateFunction<InferOutput<TSchema>>)
}
