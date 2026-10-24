---
title: Nuxt Formisch
description: Type-safe, headless forms for Nuxt with Formisch and Valibot, plus an optional AutoForm for Nuxt UI.
navigation: false
---

::u-page-hero
---
orientation: horizontal
---
#title
Type-safe forms for Nuxt

#description
[Formisch](https://formisch.dev) and [Valibot](https://valibot.dev) wired into Nuxt: auto-imported composables and components, server validation with the same schema, and an optional AutoForm that renders a whole form with Nuxt UI.

#links
  :::u-button{to="/getting-started" size="xl" trailing-icon="i-lucide-arrow-right"}
  Get started
  :::

  :::u-button{to="https://github.com/onmax/nuxt-formisch" target="_blank" size="xl" color="neutral" variant="outline" icon="i-simple-icons-github"}
  GitHub
  :::

#default
```vue [app/pages/login.vue]
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
    <button :disabled="form.isSubmitting">Log in</button>
  </FForm>
</template>
```
::

::u-page-section
  :::u-page-grid
    ::::u-page-feature{icon="i-lucide-wand-sparkles" title="Zero setup" to="/getting-started"}
    Add the module and `useForm`, `useField`, `FForm`, `FField` and every Formisch method are auto-imported.
    ::::

    ::::u-page-feature{icon="i-lucide-shield-check" title="One schema, both sides" to="/forms/server-validation"}
    Validate request bodies in server routes with `readValidatedFormBody` and the schema your form uses.
    ::::

    ::::u-page-feature{icon="i-lucide-layout-template" title="AutoForm for Nuxt UI" to="/auto-form"}
    Pass a Valibot schema to `<FAutoForm>` and get typed output, inputs, labels, errors, nested objects and arrays.
    ::::
  :::
::
