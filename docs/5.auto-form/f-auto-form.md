---
icon: ph:article-duotone
---

# FAutoForm

Generates a complete form from a Valibot object schema. Handles field rendering, validation, and layout automatically.

## Usage

```vue [components/UserForm.vue]
<template>
  <FAutoForm
    :schema="schema"
    :initial-values="initialValues"
    :field-config="fieldConfig"
    :columns="2"
    @submit="onSubmit"
  >
    <template #actions="{ isDirty, isSubmitting, reset }">
      <UButton variant="ghost" @click="reset">Reset</UButton>
      <UButton type="submit" :loading="isSubmitting">Save</UButton>
    </template>
  </FAutoForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  firstName: v.pipe(v.string(), v.minLength(1)),
  lastName: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  role: v.picklist(['admin', 'user', 'guest']),
  bio: v.optional(v.string()),
  active: v.boolean()
})

const initialValues = { role: 'user' as const, active: true }

const fieldConfig = {
  bio: { component: 'UTextarea', colSpan: 2 },
  active: { label: 'Account Active' }
}

function onSubmit(values: v.InferOutput<typeof schema>) {
  console.log(values)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `ValibotObjectSchema` | **Required** | Valibot object schema |
| `initialValues` | `Partial<T>` | `{}` | Initial form values |
| `fieldConfig` | `Record<string, FieldConfig>` | `{}` | Per-field configuration |
| `columns` | `number` | `1` | Grid columns |
| `validateOn` | `'blur' \| 'input' \| 'change'` | `'blur'` | When to validate |
| `disabled` | `boolean` | `false` | Disable all fields |

### schema

A Valibot object schema. Nested objects and arrays are supported.

```ts
const schema = v.object({
  user: v.object({
    name: v.string(),
    email: v.pipe(v.string(), v.email())
  }),
  tags: v.array(v.string())
})
```

### initialValues

Pre-populate form fields. Partial values are merged with schema defaults.

```ts
const initialValues = {
  user: { name: 'John' }
}
```

### fieldConfig

Override field rendering and behavior. Keys match schema field paths (dot notation for nested).

```ts
interface FieldConfig {
  label?: string
  placeholder?: string
  description?: string
  unit?: string
  component?: string
  componentProps?: Record<string, unknown>
  section?: string
  order?: number
  hidden?: boolean
  colSpan?: number
  disabled?: boolean
}
```

#### Example

```ts
const fieldConfig = {
  email: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    description: 'We will never share your email'
  },
  password: {
    component: 'UInput',
    componentProps: { type: 'password' }
  },
  bio: {
    component: 'UTextarea',
    colSpan: 2,
    section: 'Profile'
  },
  internalId: { hidden: true }
}
```

### columns

Number of grid columns. Fields flow left-to-right. Use `colSpan` in `fieldConfig` for fields that span multiple columns.

```vue
<FAutoForm :schema="schema" :columns="3" :field-config="{
  description: { colSpan: 3 },
  startDate: { colSpan: 1 },
  endDate: { colSpan: 1 }
}" />
```

### validateOn

When to trigger field validation:
- `'blur'` — Validate when field loses focus (default)
- `'input'` — Validate on every keystroke
- `'change'` — Validate on change event

### disabled

Disables all form inputs when `true`.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@submit` | `values: T` | Emitted on successful validation |
| `@error` | `errors: ValidationError[]` | Emitted when validation fails |

```vue
<FAutoForm
  :schema="schema"
  @submit="handleSubmit"
  @error="handleError"
/>
```

## Slots

### #actions

Renders form actions (submit button, reset, etc.). Receives form state.

```vue
<template #actions="{ isDirty, isSubmitting, reset }">
  <UButton variant="ghost" :disabled="!isDirty" @click="reset">
    Reset
  </UButton>
  <UButton type="submit" :loading="isSubmitting" :disabled="!isDirty">
    Save
  </UButton>
</template>
```

| Property | Type | Description |
|----------|------|-------------|
| `isDirty` | `boolean` | True if form has changes |
| `isSubmitting` | `boolean` | True during submission |
| `reset` | `() => void` | Reset form to initial values |

### #section:{name}

Custom rendering for a section. Replace the default section wrapper.

```vue
<template #section:profile="{ fields }">
  <UCard>
    <template #header>Profile Information</template>
    <component :is="field.component" v-for="field in fields" :key="field.name" />
  </UCard>
</template>
```

### #field:{name}

Custom rendering for a specific field. Replace auto-generated field entirely.

```vue
<template #field:avatar="{ field, modelValue, error }">
  <UFormField label="Avatar" :error="error">
    <AvatarUploader v-model="modelValue" />
  </UFormField>
</template>
```

| Property | Type | Description |
|----------|------|-------------|
| `field` | `ResolvedField` | Field metadata |
| `modelValue` | `Ref` | Two-way value binding |
| `error` | `string \| undefined` | First validation error |

## Sections

Group fields into sections using `fieldConfig`:

```ts
const fieldConfig = {
  firstName: { section: 'Personal' },
  lastName: { section: 'Personal' },
  email: { section: 'Contact' },
  phone: { section: 'Contact' },
  company: { section: 'Work' }
}
```

Sections render in order of first appearance. Use `order` to control field order within sections.

## Examples

### Basic Form

```vue
<template>
  <FAutoForm :schema="schema" @submit="onSubmit">
    <template #actions="{ isSubmitting }">
      <UButton type="submit" :loading="isSubmitting">Submit</UButton>
    </template>
  </FAutoForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name required')),
  email: v.pipe(v.string(), v.email('Invalid email'))
})

const onSubmit = (values) => console.log(values)
</script>
```

### Multi-Column Layout

```vue
<FAutoForm
  :schema="schema"
  :columns="2"
  :field-config="{
    notes: { colSpan: 2, component: 'UTextarea' }
  }"
  @submit="onSubmit"
/>
```

### With Sections

```vue
<FAutoForm
  :schema="schema"
  :field-config="{
    firstName: { section: 'Personal', order: 1 },
    lastName: { section: 'Personal', order: 2 },
    email: { section: 'Contact' },
    phone: { section: 'Contact' }
  }"
  @submit="onSubmit"
/>
```
