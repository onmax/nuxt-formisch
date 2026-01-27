---
icon: ph:article-duotone
---

# FForm

A form wrapper component that handles submission and prevents default browser validation. Use this as the root element for Formisch forms.

## Usage

```vue [components/LoginForm.vue]
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <!-- form fields -->
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
| `onSubmit` | `SubmitHandler<TSchema>` | **Required.** Handler called with validated values on successful submission |

### of

The form store returned by `useForm`. Provides form state and validation.

### onSubmit

Called when the form is submitted and validation passes. Receives the validated output values and the submit event.

```ts
type SubmitHandler<TSchema> = (
  output: v.InferOutput<TSchema>,
  event: SubmitEvent
) => MaybePromise<unknown>
```

The handler can be async. While it runs, `form.isSubmitting` is `true`.

## Slots

### default

The default slot for form content. No slot props are provided.

```vue
<FForm :of="form" :on-submit="onSubmit">
  <input v-model="field.input" />
  <button type="submit">Submit</button>
</FForm>
```

## Rendered Output

`FForm` renders a native `<form>` element with `novalidate` attribute to disable browser validation.

```html
<form novalidate>
  <!-- slot content -->
</form>
```

## Examples

### With Loading State

```vue
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <input v-model="emailField.input" type="email" />
    <button type="submit" :disabled="form.isSubmitting">
      {{ form.isSubmitting ? 'Submitting...' : 'Submit' }}
    </button>
  </FForm>
</template>
```

### With Nuxt UI

```vue
<template>
  <FForm :of="form" :on-submit="onSubmit" class="space-y-4">
    <UFormField label="Email" :error="emailField.errors?.[0]">
      <UInput v-model="emailField.input" type="email" />
    </UFormField>

    <UButton type="submit" :loading="form.isSubmitting">
      Submit
    </UButton>
  </FForm>
</template>
```

### Async Submission

```vue
<script setup lang="ts">
async function onSubmit(values: v.InferOutput<typeof schema>) {
  // form.isSubmitting is true during this
  await $fetch('/api/submit', {
    method: 'POST',
    body: values
  })
}
</script>
```
