import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, createPage, fetch, setup } from '@nuxt/test-utils/e2e'

describe('module without Nuxt UI', async () => {
  await setup({ rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)), browser: true })

  it('auto-imports Formisch composables, methods and components', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Formisch Test')
    expect(html).toContain('type="email"')
    expect(html).toMatch(/<p id="email">\s*ada@example.com\s*<\/p>/)
    expect(html).toMatch(/<p id="tags">\s*1\s*<\/p>/)
    expect(html).toContain('{&quot;email&quot;:&quot;ada@example.com&quot;,&quot;tags&quot;:[&quot;math&quot;]}')
    expect(html).toMatch(/<p id="inferred">\s*object\s*<\/p>/)
  })

  it('returns the validated body from readValidatedFormBody', async () => {
    const body = await $fetch('/api/profile', { method: 'POST', body: { email: 'ada@example.com', age: 36 } })
    expect(body).toEqual({ email: 'ada@example.com', age: 36 })
  })

  it('answers 400 with every issue when validation fails', async () => {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'nope', age: 12 }),
    })
    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.message).toBe('Invalid email')
    expect(error.data.issues).toEqual([
      { message: 'Invalid email', path: ['email'] },
      { message: 'Must be 18 or older', path: ['age'] },
    ])
  })

  // Regression for #7, against Formisch's native insert/remove.
  it('duplicates, edits, removes and submits object-array rows', async () => {
    const page = await createPage('/array-regression')
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    const rows = page.locator('[data-testid^="run-"]')

    await page.getByTestId('name-0').waitFor({ timeout: 10_000 })
    expect(await rows.count()).toBe(2)

    await page.getByTestId('duplicate-0').click()
    await page.getByTestId('name-2').waitFor({ timeout: 5_000 })
    expect(await rows.count()).toBe(3)
    expect(await page.getByTestId('name-1').inputValue()).toBe('Run 1')

    await page.getByTestId('name-1').fill('Run 1 Copy')
    await page.getByTestId('window-size-1').fill('9')
    // Editing the copy must not leak into the original row.
    expect(await page.getByTestId('name-0').inputValue()).toBe('Run 1')

    await page.getByTestId('delete-2').click()
    await expect.poll(() => rows.count()).toBe(2)

    await page.getByTestId('submit').click()
    await expect.poll(() => page.getByTestId('output').textContent()).not.toBe('')
    expect(JSON.parse(await page.getByTestId('output').textContent() ?? '')).toEqual({
      runs: [
        { name: 'Run 1', config: { windowSize: 1 } },
        { name: 'Run 1 Copy', config: { windowSize: 9 } },
      ],
    })
    expect(pageErrors).toEqual([])
    await page.close()
  }, 30_000)
})
