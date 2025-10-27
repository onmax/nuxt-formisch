import * as v from 'valibot'

/**
 * Shared schemas - usable in both client and server
 * Place in utils/ folder for auto-import in Nuxt
 */

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Min 8 chars')),
})

export const contactSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Min 2 chars')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  message: v.pipe(v.string(), v.minLength(10, 'Min 10 chars')),
})

export type LoginInput = v.InferInput<typeof loginSchema>
export type ContactInput = v.InferInput<typeof contactSchema>
