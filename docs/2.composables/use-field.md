---
icon: ph:textbox-duotone
---

# useField

Binds a single field from a form store with reactive state, validation, and element props. Use this composable to connect form fields to input elements.

## Usage

```vue [components/EmailInput.vue]
<template>
  <input v-model="field.input" type="email" v-bind="field.props" />
  <p v-if="field.errors">{{ field.errors[0] }}</p>
</template>

<script setup lang="ts">
const field = useField(() => form, () => ({ path: ['email'] as const }))
</script>
```

## Parameters

Both parameters are getter functions to support reactivity.

```ts
useField(
  () => form,                          // FormStore getter
  () => ({ path: ['email'] as const }) // Config getter
)
```

### form

A getter returning the `FormStore` from `useForm`.

### config

A getter returning the field configuration.

```ts
interface UseFieldConfig<TSchema, TFieldPath> {
  path: ValidPath<v.InferInput<TSchema>, TFieldPath>
}
```

The `path` is a tuple of keys pointing to the field in your schema. Use `as const` for type inference.

```ts
// Simple path
{ path: ['email'] as const }

// Nested path
{ path: ['address', 'city'] as const }

// Array item path
{ path: ['items', 0, 'name'] as const }
```

## Return Value

```ts
interface FieldStore<TSchema, TFieldPath> {
  path: ValidPath<...>
  input: PathValue<...>
  errors: string[] | null
  isTouched: boolean
  isDirty: boolean
  isValid: boolean
  props: FieldElementProps
}
```

### path

The field path as provided in config.

### input

Reactive getter/setter for the field value. Use with `v-model`.

```vue
<input v-model="field.input" />
```

### errors

Array of validation error messages for this field, or `null` if valid.

### isTouched

True if this field has been focused.

### isDirty

True if the field value differs from its initial value.

### isValid

True when no validation errors exist for this field.

### props

Element props for binding to native form elements.

```ts
interface FieldElementProps {
  name: string
  autofocus: boolean
  ref: (element: Element | null) => void
  onFocus: (event: FocusEvent) => void
  onChange: (event: Event) => void
  onBlur: (event: FocusEvent) => void
}
```

Spread these props onto native inputs for automatic event handling.

```vue
<input v-model="field.input" v-bind="field.props" />
```

## Examples

### With Nuxt UI

```vue
<template>
  <UFormField label="Email" :error="emailField.errors?.[0]">
    <UInput v-model="emailField.input" type="email" />
  </UFormField>
</template>

<script setup lang="ts">
const emailField = useField(() => form, () => ({ path: ['email'] as const }))
</script>
```

### Nested Fields

```vue
<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  address: v.object({
    street: v.string(),
    city: v.string(),
    zip: v.string()
  })
})

const form = useForm({ schema })
const streetField = useField(() => form, () => ({ path: ['address', 'street'] as const }))
const cityField = useField(() => form, () => ({ path: ['address', 'city'] as const }))
const zipField = useField(() => form, () => ({ path: ['address', 'zip'] as const }))
</script>
```

### Conditional Fields

```vue
<template>
  <UFormField label="Company" :error="companyField.errors?.[0]" v-if="showCompany">
    <UInput v-model="companyField.input" />
  </UFormField>
</template>

<script setup lang="ts">
const showCompany = ref(false)
const companyField = useField(() => form, () => ({ path: ['company'] as const }))
</script>
```
