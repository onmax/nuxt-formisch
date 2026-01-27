---
icon: ph:textbox-duotone
---

# FField

A scoped slot component that provides field state without requiring the `useField` composable in your script. Useful for simpler templates or when you prefer component-based field binding.

## Usage

```vue [components/LoginForm.vue]
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <FField v-slot="email" :of="form" :path="['email']">
      <input v-model="email.input" type="email" />
      <p v-if="email.errors">{{ email.errors[0] }}</p>
    </FField>
    <button type="submit">Submit</button>
  </FForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email())
})

const form = useForm({ schema })

function onSubmit(values: v.InferOutput<typeof schema>) {
  console.log(values)
}
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `of` | `FormStore<TSchema>` | **Required.** The form store from `useForm` |
| `path` | `ValidPath<...>` | **Required.** Path tuple to the field in the schema |

### of

The form store returned by `useForm`.

### path

A tuple of keys pointing to the field in your schema. Unlike `useField`, you don't need `as const` here since the component handles type inference.

```vue
<!-- Simple path -->
<FField :of="form" :path="['email']" v-slot="field">

<!-- Nested path -->
<FField :of="form" :path="['address', 'city']" v-slot="field">

<!-- Array item path -->
<FField :of="form" :path="['items', 0, 'name']" v-slot="field">
```

## Slot Props

The default slot receives the full `FieldStore` as props.

```ts
interface FieldStore {
  path: ValidPath<...>
  input: PathValue<...>
  errors: string[] | null
  isTouched: boolean
  isDirty: boolean
  isValid: boolean
  props: FieldElementProps
}
```

### input

Reactive getter/setter for the field value.

### errors

Array of validation error messages, or `null` if valid.

### isTouched

True if this field has been focused.

### isDirty

True if the field value differs from its initial value.

### isValid

True when no validation errors exist.

### props

Element props for native inputs with automatic event handling.

## Examples

### With Nuxt UI

```vue
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <FField v-slot="email" :of="form" :path="['email']">
      <UFormField label="Email" :error="email.errors?.[0]">
        <UInput v-model="email.input" type="email" />
      </UFormField>
    </FField>
  </FForm>
</template>
```

### Native Input Binding

Use the `props` object to bind event handlers to native inputs.

```vue
<FField v-slot="field" :of="form" :path="['email']">
  <input
    v-model="field.input"
    type="email"
    v-bind="field.props"
  />
</FField>
```

### Multiple Fields

```vue
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <FField v-slot="email" :of="form" :path="['email']">
      <input v-model="email.input" type="email" />
    </FField>

    <FField v-slot="password" :of="form" :path="['password']">
      <input v-model="password.input" type="password" />
    </FField>
  </FForm>
</template>
```

## FField vs useField

Both provide the same functionality. Choose based on preference.

**Use `FField`** when:
- You want to keep field logic in the template
- You have simple forms with few fields
- You prefer component-based patterns

**Use `useField`** when:
- You need to access field state in script
- You have complex field logic
- You want to create reusable field components
