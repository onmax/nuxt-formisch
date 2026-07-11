import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'

describe('Array mutation regression', async () => {
  await setup({
    rootDir: resolve(__dirname, '..'),
    browser: true,
  })

  it('duplicates, edits, removes, and submits object-array rows', async () => {
    const page = await createPage('/array-regression')
    const pageErrors: string[] = []

    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    await page.waitForSelector('[data-testid="name-0"]', { timeout: 10000 })
    expect(await page.locator('[data-testid^="run-"]').count()).toBe(2)

    await page.locator('[data-testid="duplicate-0"]').click()
    await page.waitForSelector('[data-testid="name-2"]', { timeout: 10000 })
    expect(await page.locator('[data-testid^="run-"]').count()).toBe(3)

    await page.locator('[data-testid="name-1"]').fill('Run 1 Copy')
    await page.locator('[data-testid="window-size-1"]').fill('9')

    await page.locator('[data-testid="delete-2"]').click()
    await page.waitForTimeout(100)
    expect(await page.locator('[data-testid^="run-"]').count()).toBe(2)

    await page.locator('[data-testid="submit"]').click()
    const output = await page.locator('[data-testid="output"]').textContent()
    expect(output).toContain('"name":"Run 1 Copy"')
    expect(output).toContain('"windowSize":9')

    expect(pageErrors).toEqual([])

    await page.close()
  }, 30000)
})
