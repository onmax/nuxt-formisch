import type { H3Event } from 'h3'
import { createError, readValidatedBody } from 'h3'
import type { StandardSchemaV1 } from '@standard-schema/spec'

/**
 * Server-side form validation composable
 * Validates request body against any Standard Schema library (Valibot, Zod, ArkType)
 *
 * @example
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   const data = await useFormValidation(event, loginSchema)
 *   return { user: data.email }
 * })
 * ```
 */
export async function useFormValidation<T>(
  event: H3Event,
  schema: StandardSchemaV1<unknown, T>,
): Promise<T> {
  return await readValidatedBody(event, async (data) => {
    const result = await schema['~standard'].validate(data)
    if (result.issues) {
      throw createError({ statusCode: 400, data: { issues: result.issues } })
    }
    return result.value
  })
}
