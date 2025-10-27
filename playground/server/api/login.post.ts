export default defineEventHandler(async (event) => {
  // useFormValidation is auto-imported by the module
  // loginSchema is auto-imported from ~/utils/schemas.ts
  const data = await useFormValidation(event, loginSchema)

  // Validation passed - data is typed as LoginInput
  console.log('Login attempt:', data.email)

  // Simulate auth logic
  return {
    success: true,
    message: 'Login successful',
    user: { email: data.email },
  }
})
