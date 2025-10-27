import { resolve } from 'node:path'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { expect } from '@playwright/test'
import { describe, it } from 'vitest'

describe('profile form E2E', async () => {
  await setup({
    rootDir: resolve(__dirname, '..'),
    browser: true,
  })

  it.skip('successfully submits form with valid data', async () => {
    const page = await createPage('/')

    // Form should have default values, just modify them
    await page.locator('input[name="name"]').fill('Jane Smith')
    await page.locator('input[name="email"]').fill('jane@example.com')
    await page.locator('select[name="role"]').selectOption('designer')
    await page.locator('input[name="age"]').fill('30')
    await page.locator('textarea[name="bio"]').fill('I am a software engineer who loves building forms.')

    // Submit
    await page.locator('button[type="submit"]').click()

    // Wait for submission
    await page.waitForTimeout(2000)

    // Check for success
    const hasSuccess = await page.locator('.bg-green-50').count()
    expect(hasSuccess).toBeGreaterThan(0)

    await page.close()
  }, 15000)

  it('shows validation errors for invalid data', async () => {
    const page = await createPage('/')

    // Clear default values and fill with invalid data
    await page.locator('input[name="name"]').fill('J')
    await page.locator('input[name="email"]').fill('not-an-email')
    await page.locator('select[name="role"]').selectOption('manager')
    await page.locator('input[name="age"]').fill('15')
    await page.locator('textarea[name="bio"]').fill('Short')

    // Submit to trigger validation
    await page.locator('button[type="submit"]').click()

    // Wait for validation errors
    await page.waitForSelector('text=at least 2 characters', { timeout: 5000 })
    await page.waitForSelector('text=Invalid email', { timeout: 5000 })
    await page.waitForSelector('text=18 or older', { timeout: 5000 })
    await page.waitForSelector('text=at least 10 characters', { timeout: 5000 })

    await page.close()
  }, 15000)
})
