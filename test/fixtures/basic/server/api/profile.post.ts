import * as v from 'valibot'

const profileSchema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  age: v.pipe(v.number(), v.minValue(18, 'Must be 18 or older')),
})

export default defineEventHandler(async (event) => {
  const profile = await readValidatedFormBody(event, profileSchema)
  return { email: profile.email, age: profile.age }
})
