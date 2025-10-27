import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('profile form validation', async () => {
  await setup({
    rootDir: resolve(__dirname, '..'),
    server: true,
  })

  it('successfully validates and submits valid profile data', async () => {
    const validData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'designer',
      experience: 'senior',
      age: 30,
      startDate: '2023-01-15',
      avatar: 'https://i.pravatar.cc/150?img=5',
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
        experience: validData.experience,
        age: validData.age,
        startDate: validData.startDate,
        avatar: validData.avatar,
        newsletter: validData.newsletter,
      },
    })
  })

  it('rejects invalid email format', async () => {
    const invalidData = {
      name: 'Jane Smith',
      email: 'not-an-email',
      role: 'developer',
      experience: 'mid',
      age: 30,
      startDate: '2023-01-15',
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
      experience: 'junior',
      age: 15,
      startDate: '2023-01-15',
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
