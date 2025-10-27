import { loginSchema } from '~/utils/schemas'

export default defineEventHandler(async (event) => {
  // useFormValidation is auto-imported by the module
  const data = await useFormValidation(event, loginSchema)

  // Validation passed - data is typed as LoginInput
  // Simulate auth logic
  return {
    success: true,
    message: 'Login successful',
    user: { email: data.email },
  }
})
