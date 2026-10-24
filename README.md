<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://nuxt-formisch.onmax.me/og/banner-light.png">
    <img src="https://nuxt-formisch.onmax.me/og/banner-dark.png" alt="Nuxt Formisch: type-safe forms for Nuxt" width="100%">
  </picture>
</p>

<h1 align="center">Nuxt Formisch</h1>

<p align="center">Type-safe, headless forms for Nuxt with Formisch and Valibot, plus an optional Nuxt UI AutoForm.</p>

<p align="center">
  <a href="https://npmx.dev/package/nuxt-formisch"><img src="https://npmx.dev/api/registry/badge/version/nuxt-formisch" alt="nuxt-formisch version"></a>
  <a href="https://npmx.dev/package/nuxt-formisch"><img src="https://npmx.dev/api/registry/badge/downloads/nuxt-formisch" alt="nuxt-formisch downloads"></a>
  <a href="https://nuxt-formisch.onmax.me"><img src="https://img.shields.io/badge/docs-nuxt--formisch.onmax.me-10b981" alt="Docs"></a>
  <a href="https://npmx.dev/package/nuxt-formisch"><img src="https://npmx.dev/api/registry/badge/license/nuxt-formisch" alt="License"></a>
</p>

[Formisch](https://formisch.dev) is a small, schema-based form library: you describe a form with a [Valibot](https://valibot.dev) schema and get typed values, field state and validation. This module auto-imports its composables, components and methods, validates request bodies in server routes with the same schema, and, with [Nuxt UI](https://ui.nuxt.com) installed, renders a whole form from a schema with `<FAutoForm>`.

## Quick start

```bash
pnpm add nuxt-formisch valibot
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-formisch'],
})
```

```vue
<!-- app/pages/login.vue -->
<script setup lang="ts">
import * as v from 'valibot'

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
})

const form = useForm({ schema: LoginSchema })

const login: SubmitHandler<typeof LoginSchema> = values =>
  $fetch('/api/login', { method: 'POST', body: values })
</script>

<template>
  <FForm :of="form" @submit="login">
    <FField v-slot="field" :of="form" :path="['email']">
      <input v-model="field.input" v-bind="field.props" type="email">
      <p v-if="field.errors">{{ field.errors[0] }}</p>
    </FField>
    <FField v-slot="field" :of="form" :path="['password']">
      <input v-model="field.input" v-bind="field.props" type="password">
      <p v-if="field.errors">{{ field.errors[0] }}</p>
    </FField>
    <button :disabled="form.isSubmitting">Log in</button>
  </FForm>
</template>
```

With Nuxt UI installed, `<FAutoForm>` renders the inputs, labels and errors from the schema:

```vue
<FAutoForm :schema="LoginSchema" @submit="login">
  <template #actions="{ isSubmitting }">
    <UButton type="submit" :loading="isSubmitting">Log in</UButton>
  </template>
</FAutoForm>
```

## Docs

[nuxt-formisch.onmax.me](https://nuxt-formisch.onmax.me): [getting started](https://nuxt-formisch.onmax.me/getting-started), [composables](https://nuxt-formisch.onmax.me/forms/composables), [methods](https://nuxt-formisch.onmax.me/forms/methods), [server validation](https://nuxt-formisch.onmax.me/forms/server-validation), [AutoForm](https://nuxt-formisch.onmax.me/auto-form).

## Develop

```bash
pnpm install
pnpm dev                          # the playground in playground/
pnpm test
pnpm --dir docs install
pnpm --dir docs dev               # the docs site in docs/
pnpm --dir docs og                # redraw docs/public/og/*.png
```

## Release

Releases are cut by [uppt](https://github.com/danielroe/uppt) from [conventional commits](https://www.conventionalcommits.org). Every push to `main` opens or updates a draft release PR with the next version and changelog. Merging it tags the release and publishes the package to npm.

## License

[MIT](./LICENSE)
