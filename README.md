# nuxt-formisch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Formisch integration for Nuxt - schema-based, headless form library

## Features

- 🚀 Auto-imports `useForm`, `useField`, `useFieldArray` composables
- 🎨 Auto-imports `FForm`, `FField`, `FFieldArray` components
- 📦 Auto-imports all Formisch methods (`focus`, `reset`, `validate`, etc.)
- 🔒 Server-side validation with `useFormValidation` composable
- ✨ Zero-config setup
- 🔥 Full TypeScript support
- ⚡️ Leverages @formisch/vue under the hood

## Quick Setup

```bash
pnpm add nuxt-formisch @formisch/vue valibot
```

Add to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-formisch']
})
```

## Usage

Create forms with minimal boilerplate:

```vue
<template>
  <FForm :of="form" :on-submit="(values) => onSubmit(values)">
    <input v-model="emailField.input" type="email" />
    <p v-if="emailField.errors">{{ emailField.errors[0] }}</p>
    <button type="submit">Submit</button>
  </FForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email'))
})

const form = useForm({ schema })
const emailField = useField(() => form, () => ({ path: ['email'] as const }))

async function onSubmit(values: v.InferOutput<typeof schema>) {
  console.log(values) // Fully typed!
}
</script>
```

## Server-Side Validation

Share schemas between client and server for full-stack type safety using Nuxt v4's `shared/` directory.

### 1. Create shared schemas in `shared/utils/`

```ts
// shared/utils/schemas.ts
import * as v from 'valibot'

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Password must be 8+ chars'))
})

export type LoginInput = v.InferInput<typeof loginSchema>
export type LoginOutput = v.InferOutput<typeof loginSchema>
```

### 2. Use in API routes with `useFormValidation`

```ts
// server/api/login.post.ts
import { loginSchema } from '#shared/utils/schemas'

export default defineEventHandler(async (event) => {
  // useFormValidation is auto-imported
  const data = await useFormValidation(event, loginSchema)

  // data is typed and validated
  return { success: true, user: data.email }
})
```

> **Note:** `useFormValidation` uses h3's `readValidatedBody` which supports Standard-Schema compatible validators. Validation errors automatically return 400 status with error details.

### 3. Use same schema in frontend

```vue
<template>
  <FForm :of="form" :on-submit="(values) => onSubmit(values)">
    <input v-model="emailField.input" type="email" />
    <p v-if="emailField.errors">{{ emailField.errors[0] }}</p>

    <input v-model="passwordField.input" type="password" />
    <p v-if="passwordField.errors">{{ passwordField.errors[0] }}</p>

    <button type="submit">Login</button>
  </FForm>
</template>

<script setup lang="ts">
// loginSchema is auto-imported from #shared/utils/schemas
import type { LoginOutput } from '#shared/utils/schemas'

const form = useForm({ schema: loginSchema })
const emailField = useField(() => form, () => ({ path: ['email'] as const }))
const passwordField = useField(() => form, () => ({ path: ['password'] as const }))

async function onSubmit(values: LoginOutput) {
  await $fetch('/api/login', { method: 'POST', body: values })
}
</script>
```

## Auto-imported

### Client Composables
- `useForm`, `useField`, `useFieldArray`

### Server Composables
- `useFormValidation` - validates request body against schema

### Components
- `FForm`, `FField`, `FFieldArray` (prefixed with F)

### Methods
- `focus`, `getAllErrors`, `getErrors`, `getInput`, `handleSubmit`, `insert`, `move`, `remove`, `replace`, `reset`, `setErrors`, `setInput`, `submit`, `swap`, `validate`

### Types
- `SubmitHandler`, `FormConfig`, `Schema`, `FieldElement`, `DeepPartial`, `PartialValues`, `PathValue`, `RequiredPath`, `ValidArrayPath`, `ValidationMode`, `ValidPath`

## Nuxt UI Integration

Works seamlessly with Nuxt UI v4. Wrap fields with `UFormField` for labels & errors, bind field state to Nuxt UI inputs:

```vue
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <UFormField label="Email" :error="emailField.errors?.[0]">
      <UInput v-model="emailField.input" type="email" />
    </UFormField>

    <UFormField label="Role" :error="roleField.errors?.[0]">
      <USelect v-model="roleField.input" :items="roles" />
    </UFormField>

    <UCheckbox v-model="newsletterField.input" label="Subscribe" />
    <UButton type="submit" :loading="form.isSubmitting">Submit</UButton>
  </FForm>
</template>

<script setup lang="ts">
const form = useForm({ schema })
const emailField = useField(() => form, () => ({ path: ['email'] as const }))
const roleField = useField(() => form, () => ({ path: ['role'] as const }))
const newsletterField = useField(() => form, () => ({ path: ['newsletter'] as const }))
</script>
```

## Demo

Check out the live demo: [nuxt-formisch.vercel.app](https://nuxt-formisch.vercel.app)

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm dev:prepare

# Develop with playground
pnpm dev

# Build playground
pnpm dev:build

# Run tests
pnpm test

# Release
pnpm release
```

## License

MIT

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-formisch/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-formisch

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-formisch.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-formisch

[license-src]: https://img.shields.io/npm/l/nuxt-formisch.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-formisch

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
