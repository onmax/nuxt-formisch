import * as v from 'valibot'

/**
 * Shared schemas - usable in both client and server
 * Place in utils/ folder for auto-import in Nuxt
 */

export const profileSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email address')),
  role: v.picklist(['developer', 'designer', 'manager', 'other'], 'Please select a role'),
  experience: v.picklist(['junior', 'mid', 'senior', 'lead'], 'Please select experience level'),
  age: v.pipe(v.number(), v.minValue(18, 'Must be 18 or older'), v.maxValue(120, 'Invalid age')),
  startDate: v.pipe(v.string(), v.minLength(1, 'Start date is required')),
  avatar: v.optional(v.pipe(v.string(), v.url('Must be a valid URL'))),
  bio: v.pipe(v.string(), v.minLength(10, 'Bio must be at least 10 characters')),
  newsletter: v.boolean(),
})

export type ProfileInput = v.InferInput<typeof profileSchema>
