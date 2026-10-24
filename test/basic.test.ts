import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'

describe('module without Nuxt UI', async () => {
  await setup({ rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)) })

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
})
