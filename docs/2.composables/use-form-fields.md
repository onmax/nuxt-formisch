---
icon: ph:rows-duotone
---

# useFormFields

Helper that simplifies field creation by returning a `field` function. Reduces boilerplate when creating multiple fields.

## Usage

```vue [components/LoginForm.vue]
<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8))
})

const form = useForm({ schema })
const { field } = useFormFields(form)

const email = field('email')
const password = field('password')
</script>
```

## Signature

```ts
function useFormFields<TSchema>(form: FormStore<TSchema>): {
  field: (key: string) => FieldStore
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `form` | `FormStore<TSchema>` | The form store from `useForm` |

## Return Value

Returns an object with a `field` function that creates field stores by key.

### field

Creates a field store for the given path. Equivalent to calling `useField` with that path.

```ts
const { field } = useFormFields(form)

// These are equivalent:
const email = field('email')
const email = useField(() => form, () => ({ path: ['email'] as const }))
```

## Comparison

Without `useFormFields`:

```ts
const emailField = useField(() => form, () => ({ path: ['email'] as const }))
const passwordField = useField(() => form, () => ({ path: ['password'] as const }))
const nameField = useField(() => form, () => ({ path: ['name'] as const }))
```

With `useFormFields`:

```ts
const { field } = useFormFields(form)
const emailField = field('email')
const passwordField = field('password')
const nameField = field('name')
```

## Example

```vue [components/ProfileForm.vue]
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <UFormField label="Name" :error="name.errors?.[0]">
      <UInput v-model="name.input" />
    </UFormField>

    <UFormField label="Email" :error="email.errors?.[0]">
      <UInput v-model="email.input" type="email" />
    </UFormField>

    <UFormField label="Bio" :error="bio.errors?.[0]">
      <UTextarea v-model="bio.input" />
    </UFormField>

    <UButton type="submit" :loading="form.isSubmitting">Save</UButton>
  </FForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(2)),
  email: v.pipe(v.string(), v.email()),
  bio: v.string()
})

const form = useForm({ schema })
const { field } = useFormFields(form)

const name = field('name')
const email = field('email')
const bio = field('bio')

function onSubmit(values: v.InferOutput<typeof schema>) {
  console.log(values)
}
</script>
```
