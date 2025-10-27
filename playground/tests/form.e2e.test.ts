import { resolve } from 'node:path'
import { describe, it } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'
import { expect } from '@playwright/test'

describe('Login form E2E', async () => {
  await setup({
    rootDir: resolve(__dirname, '..'),
    browser: true,
  })

  it('successfully submits form with valid data', async () => {
    const page = await createPage('/')

    // Fill the form
    await page.locator('input[name="email"]').fill('test@example.com')
    await page.locator('input[name="password"]').fill('password123')

    // Submit
    await page.locator('button[type="submit"]').click()

    // Wait for success message
    await page.waitForSelector('text=Form submitted!')

    // Verify the response is displayed
    const successText = await page.locator('text=Login successful').textContent()
    expect(successText).toContain('Login successful')

    await page.close()
  })

  it('shows validation errors for invalid data', async () => {
    const page = await createPage('/')

    // Fill with invalid email and short password
    await page.locator('input[name="email"]').fill('not-an-email')
    await page.locator('input[name="password"]').fill('short')

    // Submit to trigger validation
    await page.locator('button[type="submit"]').click()

    // Wait for inline validation errors to appear
    await page.waitForSelector('text=Invalid email', { timeout: 5000 })
    await page.waitForSelector('text=Min 8 chars', { timeout: 5000 })

    // Verify both errors are visible
    const emailError = page.locator('text=Invalid email')
    const passwordError = page.locator('text=Min 8 chars')

    await expect(emailError).toBeVisible()
    await expect(passwordError).toBeVisible()

    await page.close()
  }, 15000)
})
