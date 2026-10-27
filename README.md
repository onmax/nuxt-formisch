<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://nuxt-formisch.onmax.me/og/banner-light.png">
    <img src="https://nuxt-formisch.onmax.me/og/banner-dark.png" alt="Nuxt Formisch: type-safe forms for Nuxt" width="100%">
  </picture>
</p>

<h1 align="center">Nuxt Formisch</h1>

<p align="center">Type-safe, headless forms for Nuxt with Formisch and Valibot, plus an optional Nuxt UI AutoForm.</p>

<p align="center">
  <a href="https://npmx.dev/package/nuxt-formisch"><img src="https://comark-ui.onmax.me/badge.svg?source=npm-version&amp;package=nuxt-formisch&amp;icon=npm" alt="nuxt-formisch version"></a>
  <a href="https://npmx.dev/package/nuxt-formisch"><img src="https://comark-ui.onmax.me/badge.svg?source=npm-downloads&amp;package=nuxt-formisch&amp;period=month&amp;icon=npm" alt="nuxt-formisch downloads"></a>
  <a href="https://nuxt-formisch.onmax.me"><img src="https://comark-ui.onmax.me/badge.svg?label=docs&amp;value=nuxt-formisch.onmax.me" alt="Docs"></a>
  <a href="https://npmx.dev/package/nuxt-formisch"><img src="https://comark-ui.onmax.me/badge.svg?label=license&amp;value=MIT" alt="License"></a>
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

Define the schema in `shared/utils/`, where both the app and the server auto-import it:

```ts
// shared/utils/schemas.ts
import * as v from 'valibot'

export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
})
```

Build the form. `useForm`, `<FForm>` and `<FField>` are auto-imported:

```vue
<!-- app/pages/login.vue -->
<script setup lang="ts">
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

Validate the same body on the server. `readValidatedFormBody` returns the typed output or throws a 400 with the issues:

```ts
// server/api/login.post.ts
export default defineEventHandler(async (event) => {
  const { email } = await readValidatedFormBody(event, LoginSchema)
  return { email }
})
```

With [Nuxt UI](https://ui.nuxt.com) in `modules`, `<FAutoForm>` renders the inputs, labels, errors and submit button from the schema:

```vue
<FAutoForm :schema="LoginSchema" @submit="login" />
```

## Docs

- [Getting started](https://nuxt-formisch.onmax.me/getting-started): install, first form, configuration
- [Forms](https://nuxt-formisch.onmax.me/forms/composables): composables, methods, components, server validation
- [AutoForm](https://nuxt-formisch.onmax.me/auto-form): usage, customization, theming
- [Migrating from 0.0.x](https://nuxt-formisch.onmax.me/getting-started/migration)

## Develop

```bash
pnpm install
pnpm dev:prepare    # stub the module and prepare the playground
pnpm dev            # the playground in playground/
pnpm test
pnpm lint
pnpm typecheck
pnpm check:doctor   # vite-doctor
pnpm validate       # build the module and run publint
```

The docs site in `docs/` is a separate project with its own lockfile:

```bash
cd docs
pnpm install
pnpm dev
pnpm og             # redraw docs/public/og/*.png
```

## Release

Releases are cut by [uppt](https://github.com/danielroe/uppt) from [conventional commits](https://www.conventionalcommits.org). Every push to `main` opens or updates a draft release PR with the next version and changelog. Merging it tags the release and publishes the package to npm.

## License

[MIT](./LICENSE)
