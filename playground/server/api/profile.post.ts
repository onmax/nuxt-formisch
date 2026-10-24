import * as v from 'valibot'
import { profileSchema } from '#shared/utils/schemas'

// The server adds a rule the client can't know about.
const serverSchema = v.object({
  ...profileSchema.entries,
  email: v.pipe(profileSchema.entries.email, v.check(email => email !== 'taken@example.com', 'This email is already registered')),
})

export default defineEventHandler(async (event) => {
  const profile = await readValidatedFormBody(event, serverSchema)
  return { saved: profile }
})
