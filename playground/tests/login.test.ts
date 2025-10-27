import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Profile form validation', async () => {
  await setup({
    rootDir: resolve(__dirname, '..'),
    server: true,
  })

  it('successfully validates and submits valid profile data', async () => {
    const validData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'designer',
      age: 30,
      bio: 'I am a software engineer who loves building forms.',
      newsletter: true,
    }

    const response = await $fetch('/api/login', {
      method: 'POST',
      body: validData,
    })

    expect(response).toMatchObject({
      success: true,
      message: 'Profile saved successfully',
      profile: {
        name: validData.name,
        email: validData.email,
        role: validData.role,
        age: validData.age,
        newsletter: validData.newsletter,
      },
    })
  })

  it('rejects invalid email format', async () => {
    const invalidData = {
      name: 'Jane Smith',
      email: 'not-an-email',
      role: 'developer',
      age: 30,
      bio: 'I am a software engineer.',
      newsletter: false,
    }

    await expect(
      $fetch('/api/login', {
        method: 'POST',
        body: invalidData,
      }),
    ).rejects.toThrow()
  })

  it('rejects age under 18', async () => {
    const invalidData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'developer',
      age: 15,
      bio: 'I am a software engineer.',
      newsletter: false,
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
      name: 'Jane Smith',
      email: 'jane@example.com',
    }

    await expect(
      $fetch('/api/login', {
        method: 'POST',
        body: invalidData,
      }),
    ).rejects.toThrow()
  })
})
