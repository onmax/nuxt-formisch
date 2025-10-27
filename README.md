# nuxt-formisch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Formisch integration for Nuxt - schema-based, headless form library

## Features

- 🚀 Auto-imports `useForm`, `useField`, `useFieldArray` composables
- 🎨 Auto-imports `FormischForm`, `FormischField`, `FormischFieldArray` components
- 📦 Auto-imports all Formisch methods (`focus`, `reset`, `validate`, etc.)
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

Create forms without imports:

```vue
<template>
  <FormischForm :of="form" :on-submit="onSubmit">
    <FormischField :of="form" name="email" type="email" />
    <button type="submit">Submit</button>
  </FormischForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email())
})

const form = useForm({ schema })

// SubmitHandler is auto-imported
const onSubmit: SubmitHandler<typeof schema> = async (values) => {
  console.log(values) // Fully typed!
}
</script>
```

## Server-Side Validation

Share schemas between client and server for full-stack type safety.

### 1. Create shared schemas in `utils/`

```ts
// utils/schemas.ts
import * as v from 'valibot'

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8))
})

export type LoginInput = v.InferInput<typeof loginSchema>
```

### 2. Use in API routes with `useFormValidation`

```ts
// server/api/login.post.ts
export default defineEventHandler(async (event) => {
  // Auto-imported: useFormValidation and loginSchema
  // Uses h3's readValidatedBody under the hood
  const data = await useFormValidation(event, loginSchema)

  // data is typed and validated
  return { success: true, user: data.email }
})
```

> **Note:** `useFormValidation` uses h3's `readValidatedBody` which supports Standard-Schema compatible validators. Validation errors automatically return 400 status with error details.

### 3. Use same schema in frontend

```vue
<template>
  <FormischForm :of="form" :on-submit="onSubmit">
    <FormischField :of="form" name="email" type="email" />
    <FormischField :of="form" name="password" type="password" />
    <button type="submit">Login</button>
  </FormischForm>
</template>

<script setup lang="ts">
// SubmitHandler and loginSchema are auto-imported
const form = useForm({ schema: loginSchema })

const onSubmit: SubmitHandler<typeof loginSchema> = async (values) => {
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
- `FormischForm`, `FormischField`, `FormischFieldArray`

### Methods
- `focus`, `getAllErrors`, `getErrors`, `getInput`, `handleSubmit`, `insert`, `move`, `remove`, `replace`, `reset`, `setErrors`, `setInput`, `submit`, `swap`, `validate`

### Types
- `SubmitHandler`, `FormConfig`, `Schema`, `FieldElement`, `DeepPartial`, `PartialValues`, `PathValue`, `RequiredPath`, `ValidArrayPath`, `ValidationMode`, `ValidPath`

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
