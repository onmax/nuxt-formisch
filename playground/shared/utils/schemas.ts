import * as v from 'valibot'

/** Shared by the client form and the server route. */
export const profileSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Use at least 2 characters')),
  email: v.pipe(v.string(), v.email('Enter a valid email')),
  role: v.picklist(['developer', 'designer', 'manager'], 'Pick a role'),
  age: v.pipe(v.number('Enter a number'), v.minValue(18, 'You must be 18 or older')),
  newsletter: v.boolean(),
})
