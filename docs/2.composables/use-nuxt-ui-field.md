---
icon: ph:link-duotone
---

# useNuxtUIField

Adapts a Formisch field store for Nuxt UI components. Returns `modelValue` and `error` in the format expected by Nuxt UI inputs.

## Usage

```vue [components/LoginForm.vue]
<template>
  <UFormField label="Email" :error="email.error">
    <UInput v-model="email.modelValue" type="email" />
  </UFormField>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email())
})

const form = useForm({ schema })
const { field } = useFormFields(form)
const email = useNuxtUIField(field('email'))
</script>
```

## Signature

```ts
function useNuxtUIField(field: FieldStore): {
  modelValue: WritableComputedRef<unknown>
  error: ComputedRef<string | undefined>
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `field` | `FieldStore` | A field store from `useField` or `useFormFields` |

## Return Value

| Property | Type | Description |
|----------|------|-------------|
| `modelValue` | `WritableComputedRef` | Two-way binding for `v-model` |
| `error` | `ComputedRef<string \| undefined>` | First error message or `undefined` |

## Comparison

Without `useNuxtUIField`:

```vue
<UFormField label="Email" :error="emailField.errors?.[0]">
  <UInput v-model="emailField.input" type="email" />
</UFormField>
```

With `useNuxtUIField`:

```vue
<UFormField label="Email" :error="email.error">
  <UInput v-model="email.modelValue" type="email" />
</UFormField>
```

## Example

```vue [components/ContactForm.vue]
<template>
  <FForm :of="form" :on-submit="onSubmit" class="space-y-4">
    <UFormField label="Name" :error="name.error">
      <UInput v-model="name.modelValue" />
    </UFormField>

    <UFormField label="Email" :error="email.error">
      <UInput v-model="email.modelValue" type="email" />
    </UFormField>

    <UFormField label="Message" :error="message.error">
      <UTextarea v-model="message.modelValue" />
    </UFormField>

    <UButton type="submit" :loading="form.isSubmitting">Send</UButton>
  </FForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  message: v.pipe(v.string(), v.minLength(10, 'Message too short'))
})

const form = useForm({ schema })
const { field } = useFormFields(form)

const name = useNuxtUIField(field('name'))
const email = useNuxtUIField(field('email'))
const message = useNuxtUIField(field('message'))

async function onSubmit(values: v.InferOutput<typeof schema>) {
  await $fetch('/api/contact', { method: 'POST', body: values })
}
</script>
```

## Combined Pattern

For maximum brevity, combine `useFormFields` and `useNuxtUIField`:

```ts
const form = useForm({ schema })
const { field } = useFormFields(form)

// Create Nuxt UI-ready fields in one line each
const name = useNuxtUIField(field('name'))
const email = useNuxtUIField(field('email'))
```
