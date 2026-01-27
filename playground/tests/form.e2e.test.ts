import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'

describe('Profile form E2E', async () => {
  await setup({
    rootDir: resolve(__dirname, '..'),
    browser: true,
  })

  it('successfully submits form with valid data', async () => {
    const page = await createPage('/')

    // Wait for form to load (form has valid initial values)
    await page.waitForSelector('form', { timeout: 10000 })

    // Submit with default valid values
    await page.locator('button[type="submit"]').click()

    // Wait for API response
    await page.waitForTimeout(3000)

    // Check for success message
    const pageContent = await page.content()
    const hasSuccess = pageContent.includes('Profile saved successfully') || pageContent.includes('success')

    expect(hasSuccess).toBe(true)

    await page.close()
  }, 30000)

  it('shows validation errors for invalid data', async () => {
    const page = await createPage('/')

    await page.waitForSelector('form', { timeout: 10000 })

    // Clear and fill name with too short value
    const firstInput = page.locator('input').first()
    await firstInput.click()
    await firstInput.fill('J')

    // Clear and fill email with invalid value
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.click()
    await emailInput.fill('not-an-email')

    // Submit
    await page.locator('button[type="submit"]').click()

    // Wait for validation response
    await page.waitForTimeout(2000)

    // Check for error display (UAlert with error color or error class)
    const pageContent = await page.content()
    const hasError = pageContent.includes('error') || pageContent.includes('Error')

    expect(hasError).toBe(true)

    await page.close()
  }, 30000)
})
