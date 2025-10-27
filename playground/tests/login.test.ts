import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Login form validation', async () => {
  await setup({
    rootDir: resolve(__dirname, '..'),
    server: true,
  })

  it('successfully validates and submits valid login data', async () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    }

    const response = await $fetch('/api/login', {
      method: 'POST',
      body: validData,
    })

    expect(response).toMatchObject({
      success: true,
      message: 'Login successful',
      user: {
        email: validData.email,
      },
    })
  })

  it('rejects invalid email format', async () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
    }

    await expect(
      $fetch('/api/login', {
        method: 'POST',
        body: invalidData,
      }),
    ).rejects.toThrow()
  })

  it('rejects short password', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
    }

    await expect(
      $fetch('/api/login', {
        method: 'POST',
        body: invalidData,
      }),
    ).rejects.toThrow()
  })

  it('rejects missing fields', async () => {
    const invalidData = {
      email: 'test@example.com',
    }

    await expect(
      $fetch('/api/login', {
        method: 'POST',
        body: invalidData,
      }),
    ).rejects.toThrow()
  })
})
