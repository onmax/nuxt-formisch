---
icon: ph:magnifying-glass-duotone
---

# Schema Introspection

`useSchemaIntrospection` analyzes a Valibot schema and returns resolved field metadata. Used internally by `FAutoForm` but available for custom form generation.

## Usage

```ts
import * as v from 'valibot'

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(2)),
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(18)),
  role: v.picklist(['admin', 'user'])
})

const fields = useSchemaIntrospection(schema)
// Returns: ResolvedField[]
```

## Signature

```ts
function useSchemaIntrospection(
  schema: ValibotObjectSchema,
  fieldConfig?: Record<string, FieldConfig>
): ResolvedField[]
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `schema` | `ValibotObjectSchema` | Valibot object schema to analyze |
| `fieldConfig` | `Record<string, FieldConfig>` | Optional per-field configuration |

## Return Value

Returns an array of `ResolvedField` objects with full field metadata.

### ResolvedField

```ts
interface ResolvedField {
  name: string
  path: string[]
  type: FieldType
  required: boolean
  constraints: FieldConstraints
  ui: FieldUI
  options?: FieldOption[]
  children?: ResolvedField[]
  itemSchema?: ValibotSchema
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Field key in schema |
| `path` | `string[]` | Full path for nested fields |
| `type` | `FieldType` | Detected field type |
| `required` | `boolean` | Whether field is required |
| `constraints` | `FieldConstraints` | Validation constraints |
| `ui` | `FieldUI` | UI configuration |
| `options` | `FieldOption[]` | Options for select/radio fields |
| `children` | `ResolvedField[]` | Nested object fields |
| `itemSchema` | `ValibotSchema` | Array item schema |

### FieldType

```ts
type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'url'
  | 'select'
  | 'array'
  | 'object'
```

### FieldConstraints

```ts
interface FieldConstraints {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
}
```

### FieldUI

```ts
interface FieldUI {
  label: string
  placeholder?: string
  description?: string
  unit?: string
  component: string
  componentProps: Record<string, unknown>
  section?: string
  order: number
  hidden: boolean
  colSpan: number
  disabled: boolean
}
```

### FieldOption

```ts
interface FieldOption {
  label: string
  value: string | number
}
```

## Example Output

```ts
const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  age: v.pipe(v.number(), v.minValue(18), v.maxValue(120)),
  role: v.picklist(['admin', 'user', 'guest'])
})

const fields = useSchemaIntrospection(schema)

// fields[0] (email):
{
  name: 'email',
  path: ['email'],
  type: 'email',
  required: true,
  constraints: {},
  ui: {
    label: 'Email',
    component: 'UInput',
    componentProps: { type: 'email' },
    order: 0,
    hidden: false,
    colSpan: 1,
    disabled: false
  }
}

// fields[1] (age):
{
  name: 'age',
  path: ['age'],
  type: 'number',
  required: true,
  constraints: { min: 18, max: 120 },
  ui: {
    label: 'Age',
    component: 'UInput',
    componentProps: { type: 'number', min: 18, max: 120 },
    order: 1,
    hidden: false,
    colSpan: 1,
    disabled: false
  }
}

// fields[2] (role):
{
  name: 'role',
  path: ['role'],
  type: 'select',
  required: true,
  constraints: {},
  ui: {
    label: 'Role',
    component: 'USelect',
    componentProps: {},
    order: 2,
    hidden: false,
    colSpan: 1,
    disabled: false
  },
  options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Guest', value: 'guest' }
  ]
}
```

## With Field Config

Field config merges into the resolved UI:

```ts
const fields = useSchemaIntrospection(schema, {
  email: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    description: 'Your primary email'
  },
  age: {
    hidden: true
  }
})

// fields[0].ui:
{
  label: 'Email Address',
  placeholder: 'you@example.com',
  description: 'Your primary email',
  component: 'UInput',
  componentProps: { type: 'email' },
  ...
}
```

## Nested Objects

Nested objects include `children` with recursive field resolution:

```ts
const schema = v.object({
  user: v.object({
    name: v.string(),
    email: v.pipe(v.string(), v.email())
  })
})

const fields = useSchemaIntrospection(schema)

// fields[0]:
{
  name: 'user',
  path: ['user'],
  type: 'object',
  children: [
    { name: 'name', path: ['user', 'name'], type: 'string', ... },
    { name: 'email', path: ['user', 'email'], type: 'email', ... }
  ]
}
```

## Arrays

Array fields include `itemSchema` for the array item type:

```ts
const schema = v.object({
  tags: v.array(v.string()),
  addresses: v.array(v.object({
    street: v.string(),
    city: v.string()
  }))
})

const fields = useSchemaIntrospection(schema)

// fields[0] (tags):
{
  name: 'tags',
  type: 'array',
  itemSchema: v.string()
}

// fields[1] (addresses):
{
  name: 'addresses',
  type: 'array',
  itemSchema: v.object({ street: v.string(), city: v.string() }),
  children: [
    { name: 'street', ... },
    { name: 'city', ... }
  ]
}
```

## Use Cases

### Custom Form Renderer

```vue
<script setup lang="ts">
const fields = useSchemaIntrospection(schema, fieldConfig)
</script>

<template>
  <form @submit.prevent="onSubmit">
    <template v-for="field in fields" :key="field.name">
      <component
        :is="field.ui.component"
        v-if="!field.ui.hidden"
        v-bind="field.ui.componentProps"
      />
    </template>
  </form>
</template>
```

### Field Validation Display

```ts
const fields = useSchemaIntrospection(schema)

for (const field of fields) {
  if (field.constraints.minLength) {
    console.log(`${field.name} requires at least ${field.constraints.minLength} characters`)
  }
}
```
