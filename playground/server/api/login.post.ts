import { profileSchema } from '~/utils/schemas'

export default defineEventHandler(async (event) => {
  // useFormValidation is auto-imported by the module
  const data = await useFormValidation(event, profileSchema)

  // Validation passed - data is typed as ProfileInput
  // Simulate saving profile
  return {
    success: true,
    message: 'Profile saved successfully',
    profile: {
      name: data.name,
      email: data.email,
      role: data.role,
      age: data.age,
      newsletter: data.newsletter,
    },
  }
})
