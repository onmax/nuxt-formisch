import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { $fetch, createPage, setup } from '@nuxt/test-utils/e2e'

describe('FAutoForm', async () => {
  await setup({ rootDir: fileURLToPath(new URL('./fixtures/auto-form', import.meta.url)), browser: true })

  let html: string
  beforeAll(async () => {
    html = await $fetch<string>('/')
  })

  it('renders leaf fields with labels from title, metadata or the key', () => {
    for (const label of ['Username', 'Email Address', 'Age', 'Role', 'Active', 'Biography']) expect(html).toContain(label)
    expect(html).toContain('type="email"')
    expect(html).toContain('type="number"')
    expect(html).toContain('years')
    expect(html).toContain('value="ada@example.com"')
    expect(html).toContain('Shown publicly')
  })

  it('leaves out hidden fields', () => {
    expect(html).not.toContain('Secret')
  })

  it('renders nested objects, records as JSON and arrays of objects', () => {
    expect(html).toContain('<legend')
    expect(html).toContain('Street Name')
    expect(html).toContain('ZIP Code')
    expect(html).toContain('Mappings')
    expect(html).toContain('&quot;a&quot;: &quot;A&quot;')
    expect(html).toContain('Add Member')
    expect(html).toContain('Add Filter')
  })

  it('renders field slots with the item path', () => {
    expect(html).toContain('<span class="custom-member-slot">members.0.name</span>')
  })

  it('renders the actions slot and the default submit button', () => {
    expect(html).toContain('Save nested')
    expect(html).toContain('Submit')
  })

  it('infers a form from JSON with jsonToValibotSchema', () => {
    expect(html).toContain('Count')
    expect(html).toContain('Label')
    expect(html).toContain('Add Tag')
  })

  it('applies app config and ui prop classes', () => {
    expect(html).toContain('app-config-root')
    expect(html).toContain('prop-grid')
  })

  // The one browser test: editing, array items and submit only happen on the client.
  it('validates, edits arrays and JSON, and submits the typed output', async () => {
    const page = await createPage('/')
    const form = page.locator('#submit')
    const name = form.locator('input').first()

    await name.fill('A')
    await form.getByRole('button', { name: 'Submit' }).click()
    await form.getByText('Too short').waitFor()

    await name.fill('Grace')
    await form.getByRole('button', { name: 'Add Tag' }).click()
    await form.locator('input').nth(1).fill('math')
    await form.locator('textarea').fill('{ "retries": 3 }')
    await form.getByRole('button', { name: 'Submit' }).click()

    await page.waitForFunction(() => document.querySelector('#submitted')?.textContent?.includes('Grace'))
    expect(JSON.parse(await page.locator('#submitted').textContent() ?? '')).toEqual({ name: 'Grace', tags: ['math'], settings: { retries: 3 } })
    await page.close()
  }, 30_000)
})
